import AskSettlement from '../class/AskSettlement';
import { SendData, AskTable } from '../class/if';
import SettleProc from '../components/SettleProc';

export default class CurPrice extends AskSettlement {
  constructor(ask:AskTable, SP:SettleProc){
    super(ask.Code, ask.AskType, SP);
    this.Add(ask);
  }
  async Accept(r:SendData){
    if(this.Code !== r.symbol) return;
    // if(this.removelist.length>0) this.RemoveFromList();
    // console.log('Accept',this.list.length,this.inProcess);
    if(this.inProcess) return;
    let pMark = false;
    this.inProcess = true;
    this.list.forEach((ask:AskTable) => {
      console.log(this.IdentifyCode,ask.id,ask.CreateTime,new Date(ask.CreateTime).getTime(),r.eventTime);
      if(new Date(ask.CreateTime).getTime() < r.eventTime){
        console.log("do");
        const price = parseFloat(r.currentClose);
        if(ask.BuyType === 0) {
          ask.Qty = parseFloat((ask.Amount / price).toFixed(8));
        } else {
          ask.Amount = ask.Qty * price;
        }
        ask.Price = price;
        ask.DealTime = r.eventTime;
        const isSettle = this.Settle(ask);
        if (isSettle) this.removelist.push(ask);
      } else {
        pMark = true;
      }
    })
    if(this.removelist.length>0){
      console.log('Accept before RemoveFormList');
      this.RemoveFromList();
    } else {
      this.inProcess = false;
    }
    if(pMark) this.inProcess = false;    
  }
}