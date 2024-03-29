import AAskManager from '../aclass/AAskManager';
import { PriceTick, AskTable, ItemInfo } from '../interface/if';

export default class ChoicePriceManager extends AAskManager {
	private PriceList:PriceTick[] = [];
	Update(info:ItemInfo) {
		return;
	}
  Add(ask:AskTable) {
    if(ask.AskType === 0 && ask.ChoicePrice &&  !ask.USetID && !ask.SetID){
			console.log('ChoicePrice Add:', JSON.stringify(ask));
      super.Add(ask);
    }
  }
	get hasOrder() {
		return this.list.length > 0;
	}
  emergencyClose() {
    this.list = [];
    console.log('ChoicePriceManager emergencyClose:', this.list.length);
  }
	AcceptPrice(priceTick: PriceTick) {
		if (this.hasOrder) this.PriceList.push(priceTick);
		for (let i=0, n=this.list.length; i < n; i++) {
			const ask = this.list[i];
			const tick = this.chkPrice(ask);
			if (tick) {
        const price = tick.lastPrice
        if(ask.Amount) {
          ask.Qty = parseFloat((ask.Amount / price).toFixed(8));
        } else {
          ask.Amount = parseFloat((ask.Qty * price).toFixed(2));
        }
        ask.Price = price;
        ask.DealTime = tick.ticktime;
        this.Settle(ask);
			} else {
				break;
			}
		}
		/*
		this.list.forEach(ask => {
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
			}
		});
		*/
	}
	private chkPrice(ask:AskTable):PriceTick | undefined {
		const lastIdx = this.PriceList.length - 1;
		const lastTick = this.PriceList[lastIdx];
		const sec = (ask.ChoicePrice as number)*1000; // to minisec
		const orderTime = new Date(ask.CreateTime).getTime();
		const toGarbageIdx:number[] = [];
		let pTick:PriceTick | undefined;
		// console.log('chkPrice:', ask.id, ask.CreateTime, orderTime, lastTick.ticktime, lastTick.lastPrice, this.PriceList.length);
		if (lastTick.ticktime - orderTime > sec) {
			this.PriceList.forEach((tick, idx) => {
				if (idx !== lastIdx) {
					if (tick.ticktime < orderTime) {
						toGarbageIdx.push(idx);
					} else {
						if (!pTick) pTick = tick;
						else if (ask.BuyType === 0) {
							if (pTick.lastPrice < tick.lastPrice) pTick = tick;
						} else {
							if (pTick.lastPrice > tick.lastPrice) pTick = tick;
						}
					}
				}
			});
			if (!pTick) pTick = lastTick;
		}
		if (toGarbageIdx.length > 0) {
			this.PriceList.splice(0, toGarbageIdx.length);
		}
		return pTick;
	}
}