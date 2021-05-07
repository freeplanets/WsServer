import { AskTable, SendData, ObjectIdentify, Msg, ErrCode, DbAns } from './if';
import DataBaseIF from '../class/DataBaseIF';
import { Connection } from 'mariadb';
import SettleProc from '../components/SettleProc'

export default abstract class AskSettlement {
  protected list:AskTable[]=[];
  protected removelist:AskTable[]=[];
  public static Identify:ObjectIdentify={}
  protected IdentifyCode:string;
  protected prices:SendData[]=[];
  protected inProcess:boolean=false;
  constructor(protected db:DataBaseIF<Connection>, protected Code:string, AskType:number,protected SP:SettleProc){
    this.IdentifyCode = `${Code}${AskType}`;
    AskSettlement.Identify[this.IdentifyCode] = true;
  }
  public Add(ask:AskTable):void{
    console.log('Add Ask:', this.IdentifyCode ,`${ask.Code}${ask.AskType}`);
    if(this.IdentifyCode !== `${ask.Code}${ask.AskType}`) return;
    if(ask.ProcStatus > 2) {
      this.Remove(ask);
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
    console.log('RemoveFromLise',JSON.stringify(this.removelist));
    this.removelist.forEach((ask)=>{
      this.Remove(ask);
      chkdo=true;
    });
    if(chkdo){
      this.removelist = [];
      this.inProcess = false;
      console.log('RemoveFromList.', this.inProcess, new Date().getTime());    
    } 
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
          this.SP.SendMessage('AskChannel', JSON.stringify(ask), ask.UserID);
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