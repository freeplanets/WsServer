import AskSettlement from './AskSettlement';
import { SendData, AskTable} from './if';

export default class LimitPrice extends AskSettlement {
  constructor(ask:AskTable){
    super(ask.Code, ask.AskType);
    this.Add(ask);
  }
  Accept(r:SendData){
    if(this.Code !== r.symbol) return;
    this.list.forEach((ask:AskTable)=>{
      console.log(this.IdentifyCode,ask.id,ask.CreateTime,new Date(ask.CreateTime).getTime(),r.eventTime);
      if (new Date(ask.CreateTime).getTime() < r.eventTime){
        console.log("do");
        const price = parseFloat(r.currentClose);
        const key = ask.BuyType ?  -1 : 1;
        if ((price - ask.AskPrice)*key >= 0) {
          if(ask.Qty){
            ask.Amount = ask.Qty * price;
          } else {
            ask.Qty = Math.round((ask.Amount*10000) / price)*10000;
            ask.Amount = ask.Qty * price;
          }
          ask.Fee = ask.Amount * ask.AskFee;
          ask.Credit = ask.Fee + ask.Amount;
          this.removelist.push(ask);
        }
      }
    });
    this.RemoveFromList();
  }
}