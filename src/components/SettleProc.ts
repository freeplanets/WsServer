import WebSocket from 'ws';
import DB from '../components/db';
import { TMsg, AskTable, SendData, WsMsg } from "../interface/if";
import { FuncKey, Channels} from '../interface/ENum';
import AskSettlement from '../aclass/AskSettlement';
import Matt from '../components/mqtt';
import CurPrice from '../components/CurPrice';
import LimitPrice from '../components/LimitPrice';
import LeverCheck from '../components/LeverCheck';
import ChannelManagement from '../class/ChannelManagement';

export const ApiChannel = 'AskCreator';
export const ClientChannel = 'AskChannel';

export default class SettleProce {
  private db:DB = new DB();
  private matt:Matt; 
  private clts:AskSettlement[]=[];
  private CM:ChannelManagement = new ChannelManagement();
  constructor(client?:string){
    console.log('SettleProce Created!!');
    this.matt = new Matt(this, client);
  }
  pushAsk(ask:AskTable):void {
    const ids = [ask.id];
    this.addAsk(ask);
    this.updateAskStatus(ids);
    if (ask.Lever > 0 && (ask.USetID || ask.SetID)) {
      this.SendAsk(Channels.ADMIN, ask, 0);
    }
  }
  private addAsk(ask:AskTable):void{
    console.log('static check:',AskSettlement.Identify);
    const idenKey = `${ask.Code}${ask.SetID || ask.USetID ? AskSettlement.LeverKey : ask.AskType}`;
    console.log('idenKey:',idenKey);
    if (!AskSettlement.Identify[idenKey]){
      if (ask.SetID || ask.USetID) {
        this.clts.push(new LeverCheck(ask, this));
      } else if (ask.AskType === 0) {
        this.clts.push(new CurPrice(ask, this));
      } else if(ask.AskType === 1) {
        this.clts.push(new LimitPrice(ask, this));
      }
    }
    this.clts.forEach((clt:AskSettlement)=>{
      clt.Add(ask);
    })
  }
  AcceptMessage(strdata:string, ws:WebSocket):void {
    const msg = this.JsonParse(strdata);
    // console.log('AcceptMessage', msg);
    switch(msg.Func) {
      case FuncKey.SET_CHANNEL:
        if(msg.ChannelName) {
          this.RegisterChannel(msg.ChannelName, ws, msg.UserID);
        }
        break;
      case FuncKey.MESSAGE:
        // console.log(`AcceptMessage ${msg.Func}`, msg);
        if (msg.ChannelName && msg.Message) {
          let UserID = 0;
          if (msg.UserID) {
            UserID = msg.UserID;
          }
          this.SendMessage(msg.ChannelName, msg.Message, UserID);
        };
        break;
      case FuncKey.CLIENT_INFO:
        console.log(`AcceptMessage ${msg.Func}`, msg);
        break;
      default:
        this.doNoFunc(msg);
    }
    /*
    if(msg.Func === FuncKey.SET_CHANNEL){
      switch(msg.Func) {
        case FuncKey.SET_CHANNEL:
          if(msg.ChannelName) {
            this.RegisterChannel(msg.ChannelName, ws, msg.UserID);
          }
          break;
      }
    } else {
      this.doNoFunc(msg);
    }
    */
  }
  doNoFunc(msg:WsMsg) {
    // console.log('doNoFunc', msg);
    let UserID:number|undefined;
    if(msg.Asks) {
      if(Array.isArray(msg.Asks)){
        msg.Asks.forEach(ask => {
          UserID = ask.UserID;
          this.pushAsk(ask);
        })
      } else {
        UserID = msg.Asks.UserID;
        this.pushAsk(msg.Asks);
      }
      delete msg.Asks;
    }
    if(msg.Ask) {
      UserID = msg.Ask.UserID;
      this.pushAsk(msg.Ask);
      delete msg.Ask;
    }
    if(UserID && (typeof(msg.Balance) === 'number' || msg.LedgerTotal) ){
      // console.log('Send to Client:', msg);
      // this.CM.Send(ClientChannel, JSON.stringify(msg), UserID);
      this.SendMessage(ClientChannel, JSON.stringify(msg), UserID);
    }
    if(msg.Message) {
      console.log ('Message from client:', msg.Message);
    }
  }
  AddAsk(strdata:string):void {
    const tmpAsk = this.JParse(strdata);
    if(tmpAsk){
      if(Array.isArray(tmpAsk)){
        tmpAsk.forEach(ask=>{
          this.pushAsk(ask);
        })
      } else {
        this.pushAsk(tmpAsk);
      }
    }
  }
  JsonParse(str:string):WsMsg {
    let msg:WsMsg;
    try {
      msg = JSON.parse(str);
      return msg;
    } catch( err ) {
      console.log('SettleProc JSON parse error:');
      console.log( str );
      console.log( err );
      msg = {
        error: 'JSON parse error!!',
      }
      return msg;
    }
  }
  JParse(str:string):AskTable | AskTable[] | undefined{
    if (str.search('AskType')===-1) return;
    try {
      return JSON.parse(str);
    } catch(err) {
      console.log('JSON parse error!!',err);
      return;
    }
  }
  async getPrice(s:SendData){
    await Promise.all(
      this.clts.map(async (clt)=>{
        await clt.Accept(s);
      })
    )
  }
  async updateAskStatus(ids:number[]):Promise<void>{
    const sql = `update AskTable set ProcStatus = 1 where id in (${ids.join(',')}) and ProcStatus = 0`;
    // console.log('updateAskStatus:',sql);
    await this.db.query(sql);
  }
  async getAsks(){
    //console.log('init getAsk ....');
    const sql="select * from AskTable where ProcStatus < 2";
    const msg:TMsg<AskTable> = await this.db.query(sql);
    //console.log(msg);
    const ids:number[] = [];
    if(msg.data){
      msg.data.forEach((ask:AskTable)=>{
        ids.push(ask.id);
        this.addAsk(ask);
      })
      if (ids.length > 0) {
        await this.updateAskStatus(ids);
      }
    }
    //this.matt.Clients = this.clts;
    //console.log('init getAsk end.');
  }
  RegisterChannel(name:string, ws:WebSocket, UserID?:number){
    console.log('SP RegisterChannel:', name, UserID);
    this.CM.Register(name,ws,UserID);
  }
  SendAsk(name:string, ask:AskTable, opt:WebSocket|number):boolean {
    const msg:WsMsg= {
      Ask: ask
    }
    return this.SendMessage(name, JSON.stringify(msg), opt);
  }  
  SendMessage(name:string, message:string, opt:WebSocket | number):boolean { // ws:WebSocket | UserID
    return this.CM.Send(name, message, opt )
  }
  RemoveFromChannel(ws:WebSocket):void{
    this.CM.Remove(ws);
  }
}
