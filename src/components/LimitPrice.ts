import AskSettlement from '../class/AskSettlement';
import { SendData, AskTable, Msg, ErrCode } from '../class/if';
import DataBaseIF from '../class/DataBaseIF';
import { Connection } from 'mariadb';

export default class LimitPrice extends AskSettlement {
  constructor(db:DataBaseIF<Connection>, ask:AskTable){
    super(db, ask.Code, ask.AskType);
    this.Add(ask);
  }
  Accept(r:SendData){
    if(this.Code !== r.symbol) return;
    this.list.forEach(async (ask:AskTable) => {
      console.log(this.IdentifyCode,ask.id,ask.CreateTime,new Date(ask.CreateTime).getTime(),r.eventTime);
      if (new Date(ask.CreateTime).getTime() < r.eventTime){
        console.log("do");
        const price = parseFloat(r.currentClose);
        const key = ask.BuyType ?  -1 : 1;
        if ((price - ask.AskPrice)*key >= 0) {
          /*
          if(ask.Qty){
            ask.Amount = ask.Qty * price;
          } else {
            ask.Qty = Math.round((ask.Amount*10000) / price)*10000;
            ask.Amount = ask.Qty * price;
          }
          */
          ask.Price = price;
          ask.Qty = parseFloat((ask.Amount / price).toFixed(8));
          ask.DealTime = r.eventTime;
          const msg:Msg = await this.Settle(ask);
          if(msg.ErrNo === ErrCode.PASS) {
            this.removelist.push(ask);
          }
        }
      }
    });
    this.RemoveFromList();
  }
}