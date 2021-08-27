import AAskManager from "../aclass/AAskManager";
import { PriceTick, AskTable } from "../interface/if";

export default class AutoSettleManager extends AAskManager {
	Add(ask:AskTable) {
    if( ask.USetID || ask.SetID){
      super.Add(ask);
    }
  }
	emergencyClose() {
		console.log('AutoSettleManager emergencyClose', this.list.length);
	}
	AcceptPrice(priceTick: PriceTick) {
    this.list.forEach((ask) => {
      const price = priceTick.lastPrice;
			if(new Date(ask.CreateTime).getTime() < priceTick.ticktime){
				if (ask.isUserSettle || (price - ask.GainPrice)*ask.ItemType > 0 || (price - ask.LosePrice)*ask.ItemType < 0) {
					// console.log('Lever check:', price, ask.GainPrice, ask.LosePrice, ask.ItemType, (price - ask.GainPrice)*ask.ItemType, (price - ask.StopLose)*ask.ItemType);
					ask.Price = price;
					ask.Amount = price * ask.Qty;
					ask.DealTime = priceTick.ticktime;
					this.Settle(ask);
					// console.log('LeverCheck Settle:',JSON.stringify(ask));
					// const isSettle = this.Settle(ask);
					// if (isSettle) this.removelist.push(ask);
				}
			}
		});
	}
}