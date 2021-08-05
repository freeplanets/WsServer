import { AskTable, SendData, ObjectIdentify, Msg } from '../interface/if';
import { ErrCode } from '../interface/ENum';
import DataBaseIF from '../interface/DataBaseIF';
import { Connection } from 'mariadb';
import SettleProc from '../components/SettleProcDB';
import Credit from '../components/Credit';

export default abstract class AskSettlementDB {
  protected list:AskTable[]=[];
  protected removelist:AskTable[]=[];
  public static Identify:ObjectIdentify={}
  protected IdentifyCode:string;
  protected prices:SendData[]=[];
  protected inProcess:boolean=false;
  protected credit:Credit = new Credit();
  constructor(protected db:DataBaseIF<Connection>, protected Code:string, AskType:number,protected SP:SettleProc){
    this.IdentifyCode = `${Code}${AskType}`;
    AskSettlementDB.Identify[this.IdentifyCode] = true;
  }
  public Add(ask:AskTable):void{
    console.log('Add Ask:', this.IdentifyCode ,`${ask.Code}${ask.AskType}`);
    if(this.IdentifyCode !== `${ask.Code}${ask.AskType}`) return;
    if(ask.ProcStatus > 2) {
      //this.Remove(ask);
      this.removelist.push(ask);
      return;
    }
    if(this.list.indexOf(ask) === -1 ) this.list.push(ask);
    // console.log('Add list',this.list);
  }
  public Remove(ask:AskTable):void{
    const idx = this.list.indexOf(ask);
    if( idx !== -1 ) this.list.splice(idx, 1); 
  }
  public RemoveFromList(){
    let chkdo:boolean=false;
    // console.log('RemoveFromList',JSON.stringify(this.removelist));
    this.removelist.forEach((ask)=>{
      this.Remove(ask);
      chkdo=true;
    });
    if(chkdo){
      this.removelist = [];
      this.inProcess = false;
      // console.log('RemoveFromList.', this.inProcess, new Date().getTime());    
    } 
  }
  protected SendToApiSvr(ask:AskTable):void {
    this.SP.SendMessage('',JSON.stringify(ask),1);
  }
  protected async Settle(ask:AskTable):Promise<Msg> {
    return new Promise((resolve,reject)=>{
      let msg:Msg = { ErrNo: ErrCode.DB_QUERY_ERROR };
      const sql = `update AskTable set 
        Qty = ${ask.Qty},
        Price = ${ask.Price},
        DealTime = ${ask.DealTime},
        ProcStatus = 2
        where id = ${ask.id}`;
        console.log('Settle:',sql);
        this.db.query(sql).then((msg=>{
          if(msg.ErrNo === ErrCode.PASS){
            ask.ProcStatus = 2;
            this.SP.SendMessage('AskChannel', JSON.stringify(ask), ask.UserID);
          }
          resolve(msg);
        })).catch(err=>{
          console.log('Settle error:',err);
          msg.ErrNo = ErrCode.DB_QUERY_ERROR;
          msg.error = err;
          resolve(msg);
        });
        /*
      msg = await this.db.query(sql);
      if(msg.ErrNo === ErrCode.PASS){
        const ans:DbAns = msg.data as DbAns;
        if(ans.affectedRows>0) return msg
      }
      return msg;
      */
    });
  }
  public abstract Accept(r:SendData):Promise<void>;
}