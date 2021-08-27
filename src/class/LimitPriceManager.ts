import AAskManager from "../aclass/AAskManager";
import { PriceTick, AskTable } from "../interface/if";

export default class LimitPriceManager extends AAskManager {
  Add(ask:AskTable) {
    if(ask.AskType === 1 && !ask.USetID && !ask.SetID){
      super.Add(ask);
    }
  }
	emergencyClose() {
		this.list = [];
		console.log('LimitPriceManager emergencyClose:', this.list.length);
	}	
	AcceptPrice(priceTick: PriceTick) {
		this.list.forEach((ask) => {
			if (new Date(ask.CreateTime).getTime() < priceTick.ticktime){
				const price = priceTick.lastPrice;
				const key = (ask.BuyType ?  1 : -1) * ask.ItemType;
				if ((price - ask.AskPrice)*key >= 0) { //58798.64 58470.93
					ask.Price = ask.AskPrice;
					ask.AskPrice = price;
					if (ask.Amount) {
						ask.Qty = parseFloat((ask.Amount / price).toFixed(8));
					} else {
						ask.Amount = parseFloat((ask.Qty * price).toFixed(2));
					}
					ask.DealTime = priceTick.ticktime;
					this.Settle(ask);
					// const isSettle = this.Settle(ask);
					// if (isSettle) this.removelist.push(ask);
				}
			}
		});
	}
}