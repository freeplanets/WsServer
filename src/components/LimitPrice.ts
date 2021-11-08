import AskSettlement from '../aclass/AskSettlement';
import { SendData, AskTable } from '../interface/if';
import { PriceCheckType } from '../interface/ENum';
import SettleProc from '../components/SettleProc';

export default class LimitPrice extends AskSettlement {
  constructor(ask:AskTable, SP:SettleProc){
    super(ask.Code, ask.AskType, SP);
    this.Add(ask);
  }
  Add(ask:AskTable) {
    if(ask.AskType !== PriceCheckType.LimitPrice) return;
    super.Add(ask);
  }
  async Accept(r:SendData){
    if(this.Code !== r.symbol) return;
    if(this.inProcess) return;
    let pMark = false;
    this.inProcess = true;
      this.list.forEach((ask:AskTable) => {
        // console.log(this.IdentifyCode,ask.id,ask.CreateTime,new Date(ask.CreateTime).getTime(),r.eventTime);
        if (new Date(ask.CreateTime).getTime() < r.eventTime){
          const price = parseFloat(r.currentClose);
          const key = (ask.BuyType ?  1 : -1) * ask.ItemType;
          // console.log('LimitPrice', ask.AskPrice, price, (price - ask.AskPrice)*key);
          if ((price - ask.AskPrice)*key >= 0) { //58798.64 58470.93
            ask.Price = ask.AskPrice;
            ask.AskPrice = price;
            if (ask.Amount) {
              ask.Qty = parseFloat((ask.Amount / ask.Price).toFixed(8));
            } else {
              ask.Amount = parseFloat((ask.Qty * ask.Price).toFixed(2));
            }
            /*
            if(ask.BuyType === 0 ) {
              ask.Qty = parseFloat((ask.Amount / price).toFixed(8));
            } else {
              ask.Amount = ask.Qty * price;
            }
            */
            ask.DealTime = r.eventTime;
            const isSettle = this.Settle(ask);
            if (isSettle) this.removelist.push(ask);
          } else {
            pMark = true;
          }
        }
      })
    if(this.removelist.length > 0) this.RemoveFromList();
    else this.inProcess = false;
    if(pMark) this.inProcess = false;
  }
}