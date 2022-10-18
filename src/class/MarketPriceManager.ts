import AAskManager from '../aclass/AAskManager';
import { PriceTick, AskTable, ItemInfo } from '../interface/if';

export default class MarketPriceManager extends AAskManager {
  Update(info:ItemInfo): void {
    return;
  }
  add(ask:AskTable) {
    if(ask.AskType === 0 && !ask.ChoicePrice && !ask.USetID && !ask.SetID){
      super.Add(ask);
    }
  }
  emergencyClose() {
    this.list = [];
    console.log('MarketPriceManager emergencyClose:', this.list.length);
  }
	AcceptPrice(priceTick: PriceTick) {
		this.list.forEach(ask=>{
      if(new Date(ask.CreateTime).getTime() < priceTick.ticktime){
        const price = priceTick.lastPrice
        if(ask.Amount) {
          ask.Qty = parseFloat((ask.Amount / price).toFixed(8));
        } else {
          ask.Amount = parseFloat((ask.Qty * price).toFixed(2));
        }
        ask.Price = price;
        ask.DealTime = priceTick.ticktime;
        this.Settle(ask);
        // console.log('CurPrice Settle:', JSON.stringify(ask));
        // const isSettle = this.Settle(ask);	
			}		
		});
	}
}