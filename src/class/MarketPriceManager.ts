import AAskManager from '../aclass/AAskManager';
import { PriceTick, AskTable } from '../interface/if';

export default class MarketPriceManager extends AAskManager {
  Add(ask:AskTable) {
    if(ask.AskType === 0 && !ask.USetID && !ask.SetID){
      super.Add(ask);
    }
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
        // console.log('CurPrice Settle:', JSON.stringify(ask));
        // const isSettle = this.Settle(ask);	
			}		
		});
	}
}