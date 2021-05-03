import { AskTable, SendData, ObjectIdentify, Msg, ErrCode, DbAns } from './if';
import DataBaseIF from '../class/DataBaseIF';
import { Connection } from 'mariadb';

export default abstract class AskSettlement {
  protected list:AskTable[]=[];
  protected removelist:AskTable[]=[];
  public static Identify:ObjectIdentify={}
  protected IdentifyCode:string;
  constructor(protected db:DataBaseIF<Connection>, protected Code:string, AskType:number){
    this.IdentifyCode = `${Code}${AskType}`;
    AskSettlement.Identify[this.IdentifyCode] = true;
  }
  public Add(ask:AskTable):void{
    if(this.IdentifyCode !== `${ask.Code}${ask.AskType}`) return;
    if(ask.ProcStatus > 2) {
      this.Remove(ask);
      return;
    }
    if(this.list.indexOf(ask) === -1 ) this.list.push(ask); 
  }
  public Remove(ask:AskTable):void{
    const idx = this.list.indexOf(ask);
    if( idx !== -1 ) this.list.splice(idx, 1); 
  }
  public RemoveFromList(){
    this.removelist.forEach((ask)=>{
      this.Remove(ask);
    });
    this.removelist = [];
  }
  protected async Settle(ask:AskTable):Promise<Msg> {
    let msg:Msg = { ErrNo: ErrCode.DB_QUERY_ERROR };
    const sql = `update AskTable set 
      Qty = ${ask.Qty},
      Price = ${ask.Price},
      DealTime = ${ask.DealTime},
      ProcStatus = 2 
      where id = ${ask.id}`;
    msg = await this.db.query(sql);
    if(msg.ErrNo === ErrCode.PASS){
      const ans:DbAns = msg.data as DbAns;
      if(ans.affectedRows>0) return msg
    }
    return msg;
  }
  public abstract Accept(r:SendData):void;
}