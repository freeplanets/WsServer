import AskSettlement from '../aclass/AskSettlement';
import { SendData, AskTable } from '../interface/if';
import { PriceCheckType } from '../interface/ENum';
import SettleProc from '../components/SettleProc';

export default class CurPrice extends AskSettlement {
  constructor(ask:AskTable, SP:SettleProc){
    super(ask.Code, ask.AskType, SP);
    this.Add(ask);
  }
  Add(ask:AskTable) {
    if( ask.AskType !== PriceCheckType.CurPrice ) return;
    super.Add(ask);
  }
  async Accept(r:SendData){
    if(this.Code !== r.symbol) return;
    // if(this.removelist.length>0) this.RemoveFromList();
    // console.log('Accept',this.list.length,this.inProcess);
    if(this.inProcess) return;
    let pMark = false;
    this.inProcess = true;
    this.list.forEach((ask:AskTable) => {
      // console.log(this.IdentifyCode,ask.id,ask.CreateTime,new Date(ask.CreateTime).getTime(),r.eventTime);
      if(new Date(ask.CreateTime).getTime() < r.eventTime){
        const price = parseFloat(r.currentClose);
        if(ask.Amount) {
          ask.Qty = parseFloat((ask.Amount / price).toFixed(8));
        } else {
          ask.Amount = parseFloat((ask.Qty * price).toFixed(2));
        }
        /*
        if(ask.BuyType === 0) {
          ask.Qty = parseFloat((ask.Amount / price).toFixed(8));
        }
        */
        ask.Price = price;
        ask.DealTime = r.eventTime;
        console.log('CurPrice Settle:', JSON.stringify(ask));
        const isSettle = this.Settle(ask);
        if (isSettle) this.removelist.push(ask);
      } else {
        pMark = true;
      }
    })
    if(this.removelist.length>0){
      // console.log('Accept before RemoveFormList');
      this.RemoveFromList();
    } else {
      this.inProcess = false;
    }
    if(pMark) this.inProcess = false;    
  }
}