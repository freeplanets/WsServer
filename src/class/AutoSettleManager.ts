import AAskManager from "../aclass/AAskManager";
import ItemManager from "./ItemManager";
import { PriceTick, AskTable, ItemInfo } from "../interface/if";

export default class AutoSettleManager extends AAskManager {
	private StayLimit = 0; // 留倉天數
	private preTs = 0;
	constructor(protected IManager:ItemManager, protected Code:string, AskType:number, StayLimit = 0) {
		super(IManager.TManager, Code, AskType);
		this.setStayLimit(StayLimit);
		console.log('AutoSettleManager set StayLimit:', this.StayLimit);
	}
	Update(info: ItemInfo): void {
			if(typeof info.StayLimit !== undefined) {
				// console.log(this.IdentifyCode, 'old StayLimit:', this.StayLimit);
				// this.StayLimit = info.StayLimit;
				this.setStayLimit(info.StayLimit);
				// console.log(this.IdentifyCode, 'new StayLimit:', this.StayLimit);
			}
	}
	private setStayLimit(StayLimit:number) {
		this.StayLimit = StayLimit * 24 * 60 * 60 * 1000 ;	// 天數 -> days * 24 * 60 * 60 * 1000 微秒
	}
	Add(ask:AskTable, initAsk = false) {
    if( ask.USetID || ask.SetID){
			// console.log('AutoSettleManager Add ask:', initAsk, ':', ask.id);
			if (initAsk && ask.USetID) {
				const ts = new Date(ask.CreateTime).getTime();
				if (this.preTs === 0 || ts < this.preTs) {
					this.IManager.GetDataTimeStamp = ts;
				}
			}
      super.Add(ask, initAsk);
    }
  }
	emergencyClose() {
		console.log('AutoSettleManager emergencyClose', this.list.length);
	}
	AcceptPrice(priceTick: PriceTick) {
    this.list.forEach((ask) => {
      const price = priceTick.lastPrice;
			const cTime = new Date(ask.CreateTime).getTime()
			// console.log('timecheck:', priceTick.ticktime, cTime, this.StayLimit, priceTick.ticktime - cTime);
			if( cTime < priceTick.ticktime){
				// console.log('Lever check:', price, ask.GainPrice, ask.LosePrice, ask.ItemType);
				if (ask.isUserSettle || (price - ask.GainPrice)*ask.ItemType > 0 
					|| (price - ask.LosePrice)*ask.ItemType < 0 || (this.StayLimit > 0 && priceTick.ticktime - cTime > this.StayLimit)) {
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