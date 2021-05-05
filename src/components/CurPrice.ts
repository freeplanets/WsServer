import AskSettlement from '../class/AskSettlement';
import { SendData, AskTable, Msg, ErrCode } from '../class/if';
import DataBaseIF from '../class/DataBaseIF';
import { Connection } from 'mariadb';

export default class CurPrice extends AskSettlement {
  constructor(db:DataBaseIF<Connection>, ask:AskTable){
    super(db, ask.Code, ask.AskType);
    this.Add(ask);
  }
  async Accept(r:SendData){
    if(this.Code !== r.symbol) return;
    if(this.removelist.length>0) this.RemoveFromList();
    //console.log('Accept',this.list.length,this.inProcess);
    if(this.inProcess) return;
    this.inProcess = true;
    await Promise.all(
      this.list.map(async (ask:AskTable) => {
        console.log(this.IdentifyCode,ask.id,ask.CreateTime,new Date(ask.CreateTime).getTime(),r.eventTime);
        if(new Date(ask.CreateTime).getTime() < r.eventTime){
          console.log("do");
          const price = parseFloat(r.currentClose);
          /*
          if(ask.Qty){
            ask.Amount = ask.Qty * price;
          } else {
            ask.Qty = Math.round((ask.Amount*10000) / price)*10000;
            ask.Amount = ask.Qty * price;
          }
          */
          ask.Qty = parseFloat((ask.Amount / price).toFixed(8));
          ask.Price = price;
          ask.DealTime = r.eventTime;
          const msg:Msg = await this.Settle(ask);
          console.log('Accept msg:',msg);
          if(msg.ErrNo === ErrCode.PASS){
            this.removelist.push(ask);
            console.log('Accecpt add removelist:',this.removelist);
          }
        }
      })      
    )
    if(this.RemoveFromList.length>0){
      console.log('before RemoveFormList');
      this.RemoveFromList();
    } else {
      this.inProcess = false;
    }
    
  }
}