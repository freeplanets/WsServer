import DB from '../components/db';
import { TMsg, AskTable, Msg } from "../class/if";
import AskSettlement from '../class/AskSettlement';
import Matt from '../components/mqtt';
import CurPrice from '../components/CurPrice';
import LimitPrice from '../components/LimitPrice';

export default class SettleProce {
  private db:DB = new DB();
  private matt:Matt = new Matt();
  private clts:AskSettlement[]=[];
  constructor(){
    console.log('SettleProce Created!!');
  }
  pushAsk(ask:AskTable):void {
    const ids = [ask.id];
    this.addAsk(ask);
    this.updateAskStatus(ids);
  }
  private addAsk(ask:AskTable):void{
    console.log('static check:',AskSettlement.Identify);
    const idenKey = `${ask.Code}${ask.AskType}`;
    console.log('idenKey:',idenKey);
    if (!AskSettlement.Identify[idenKey]){
      if (ask.AskType === 0) {
        this.clts.push(new CurPrice(this.db, ask));
      } else if(ask.AskType === 1) {
        this.clts.push(new LimitPrice(this.db, ask));
      }
    } else {
      this.clts.forEach((clt:AskSettlement)=>{
        clt.Add(ask);
      })
    }
  }
  JsonParse(str:string):AskTable | undefined{
    if (str.search('AskType')===-1) return;
    try {
      return JSON.parse(str);
    } catch(err) {
      console.log('JSON parse error!!',err);
      return;
    }
  }
  async updateAskStatus(ids:number[]):Promise<void>{
    const sql = `update AskTable set ProcStatus = 1 where id in (${ids.join(',')})`;
    console.log('updateAskStatus:',sql);
    await this.db.query(sql);
  }
  async getAsks(){
    const sql="select * from AskTable where ProcStatus < 2";
    const msg:TMsg<AskTable> = await this.db.query(sql);
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
    this.matt.Clients = this.clts;
  }
}
