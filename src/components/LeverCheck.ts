import AskChannel from '../class/AskChannel';
import AskSettlement from '../class/AskSettlement';
import { SendData, AskTable } from '../class/if';
import SettleProc, { ClientChannel } from '../components/SettleProc';

export default class LeverCheck extends AskSettlement {
  constructor(ask:AskTable, SP:SettleProc){
    super(ask.Code, AskSettlement.LeverKey, SP);
    this.Add(ask);
  }
  Add(ask:AskTable) {
    if(ask.USetID) {
      this.removelist.push(ask);
      return;      
    }
    this.SP.SendAsk(ClientChannel, ask, ask.UserID);
    super.Add(ask);
    // console.log('LeverCheck Add removelist:', this.removelist.length, JSON.stringify(this.removelist));
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
      const Gain = (price - ask.AskPrice) * ask.Lever * ask.ItemType * ask.Qty;
      const TotalCredit = ask.LeverCredit + ask.ExtCredit;
      const LoseRate = (TotalCredit+Gain)/TotalCredit;
      // console.log('Lever check:', price, Gain, ask.AskPrice, TotalCredit, ((Gain/ask.LeverCredit)).toFixed(2), (LoseRate).toFixed(2), ask.StopGain, ask.StopLose);
      // console.log('check', Gain/ask.LeverCredit > ask.StopGain, LoseRate < (1-ask.StopLose));
      if( Gain/ask.LeverCredit > ask.StopGain || LoseRate < (1-ask.StopLose)) {
        ask.Price = price;
        ask.Amount = Gain;
        ask.DealTime = r.eventTime;
        // console.log('LeverCheck Settle:',JSON.stringify(ask));
        const isSettle = this.Settle(ask);
        if (isSettle) this.removelist.push(ask);
      } else {
        pMark = true;
      }
    })
    // console.log('Accept before RemoveFormList', this.removelist.length);
    if(this.removelist.length>0){
      // console.log('Accept before RemoveFormList');
      this.RemoveFromList();
    } else {
      this.inProcess = false;
    }
    if(pMark) this.inProcess = false;    
  }
}