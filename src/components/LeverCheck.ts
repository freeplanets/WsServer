import AskSettlement from '../class/AskSettlement';
import { SendData, AskTable } from '../class/if';
import SettleProc from '../components/SettleProc';

export default class LeverCheck extends AskSettlement {
  constructor(ask:AskTable, SP:SettleProc){
    super(ask.Code, 2, SP);
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
      const price = parseFloat(r.currentClose);
      const Gain = (price - ask.Price) * ask.Lever * ask.ItemType;
      const TotalCredit = ask.Amount + ask.ExtCredit;
      const LoseRate = (TotalCredit+Gain)/TotalCredit;
      if( ask.Price/Gain > ask.StopGain || LoseRate < ask.StopLose) {
        ask.Price = price;
        ask.Amount = ask.Qty * price;
        ask.DealTime = r.eventTime;
        this.Settle(ask);
        this.removelist.push(ask);
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