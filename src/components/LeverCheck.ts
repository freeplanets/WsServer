import AskChannel from '../class/AskChannel';
import AskSettlement from '../aclass/AskSettlement';
import { SendData, AskTable } from '../interface/if';
import SettleProc, { ClientChannel } from '../components/SettleProc';

export default class LeverCheck extends AskSettlement {
  constructor(ask:AskTable, SP:SettleProc){
    super(ask.Code, AskSettlement.LeverKey, SP);
    this.Add(ask);
  }
  Add(ask:AskTable) {
    /*
    if(ask.USetID) {
      this.removelist.push(ask);
      return;      
    }
    */
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
      // const Gain = (price - ask.AskPrice) * ask.Lever * ask.ItemType * ask.Qty;
      // const TotalCredit = ask.LeverCredit + ask.ExtCredit;
      // const LoseRate = (TotalCredit+Gain)/TotalCredit;
      // console.log('Lever check:', price, Gain, ask.AskPrice, TotalCredit, ((Gain/ask.LeverCredit)).toFixed(2), (LoseRate).toFixed(2), ask.StopGain, ask.StopLose);
      // console.log('check', Gain/ask.LeverCredit > ask.StopGain, LoseRate < (1-ask.StopLose));
      // if( Gain/ask.LeverCredit > ask.StopGain || LoseRate < (1-ask.StopLose)) {
      // if (ask.Code === 'ETHUSDT') {
      //  console.log('Lever check:', price, ask.GainPrice, ask.LosePrice, ask.ItemType, (price - ask.GainPrice)*ask.ItemType, (price - ask.StopLose)*ask.ItemType);
      // }
      if (ask.isUserSettle || (price - ask.GainPrice)*ask.ItemType > 0 || (price - ask.LosePrice)*ask.ItemType < 0) {
        console.log('Lever check:', price, ask.GainPrice, ask.LosePrice, ask.ItemType, (price - ask.GainPrice)*ask.ItemType, (price - ask.StopLose)*ask.ItemType);
        let settlePrice = price;
        if((price - ask.GainPrice)*ask.ItemType > 0) settlePrice = parseFloat(ask.GainPrice.toFixed(2));
        if((price - ask.LosePrice)*ask.ItemType < 0) settlePrice = parseFloat(ask.LosePrice.toFixed(2));
        ask.Price = settlePrice;
        ask.Amount = parseFloat((settlePrice * ask.Qty).toFixed(2));
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