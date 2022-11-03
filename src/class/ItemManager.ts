import { AskTable, ItemInfo } from '../interface/if';
import AAskManager from '../aclass/AAskManager';
import AutoSettleManager from './AutoSettleManager';
import MarketPriceManager from './MarketPriceManager';
import LimitPriceManager from './LimitPriceManager';
import ChoicePriceManager from './ChoicePriceManager';
import MarketTickDB from './MarketTickDB';
// import TotalManager from './TotalManager';
import { ATotalManager } from "../aclass/ATotalManager";

export default class ItemManager {
	protected list:AAskManager[] = [];
	private currencypair:string;
	private code:string;
	// private id:number;
	private tsForGetData = 0;
	private marketTick;
	private StayLimit = 0;
	constructor(private TM:ATotalManager, info: ItemInfo, mt:MarketTickDB) {
		this.marketTick = mt;
		// this.id = info.id;
		console.log('ItemInfo', info);
		this.code = info.Code;
		this.StayLimit = info.StayLimit;
		let tmp = info.Code;
		const fIdx = tmp.indexOf('/');
		if(fIdx<0) this.currencypair = tmp.replace('USDT', '/USDT');
		else this.currencypair = tmp;
	}
	get TManager() {
		return this.TM;
	}
	set GetDataTimeStamp(n:number) {
		console.log('set tsForGetData', n);
		this.tsForGetData = n;
	}
	public Update(info:ItemInfo) {
		if (this.Code === info.Code) {
			// this.list.forEach((itm) => itm.)
			console.log('ItemManager update before', this.Code, this.StayLimit);
			if (typeof info.StayLimit !== undefined) {
				this.StayLimit = info.StayLimit;
				this.list.forEach((itm) => itm.Update(info));
				console.log('ItemManager update', this.StayLimit)
				// console.log(info);
			}
		}
	}
	get Code() {
		return this.code;
	}
	AddAsk(ask:AskTable, initAsk = false) {
		if(ask.Code !== this.Code) return;
		let key = ask.USetID || ask.SetID ? AAskManager.LeverKey : ask.AskType;
		if (!key && ask.ChoicePrice) {
			key = AAskManager.ChoiceKey;
		}
		const IdentifyCode = `${this.Code}${key}`;
		console.log('AddAsk:', IdentifyCode);
		if (!AAskManager.Identify[IdentifyCode]) {
			switch(key) {
				case 1:
					this.list.push(new LimitPriceManager(this.TM, this.Code, key));
					break;
				case AAskManager.LeverKey:
					this.list.push(new AutoSettleManager(this, this.Code, key, this.StayLimit));
					break;
				case AAskManager.ChoiceKey:
					this.list.push(new ChoicePriceManager(this.TM, this.Code, key));
					break;
				default:
					this.list.push(new MarketPriceManager(this.TM, this.Code, key));
			}
		}
		this.list.forEach(manager=>{
			manager.Add(ask, initAsk);
		})
		if(this.tsForGetData === 0) {
			this.tsForGetData = new Date().getTime();
			console.log('set tsForGetData from getTime', this.tsForGetData);
		}
		this.checkForNext(this.tsForGetData);
	}
	private getData(ts:number) {
		this.marketTick.getData(this.currencypair, ts).then(res=>{
			// console.log('getData:', this.currencypair, ts, JSON.stringify(res));
			res.forEach(itm=>{
				this.list.forEach(mag=>{
					mag.AcceptPrice(itm);
				})
				this.tsForGetData = itm.ticktime;
			})
			this.TM.SavePriceTick(res);
			this.checkForNext(ts);			
		}).catch(err=>{
			console.log('ItemManager getData error', err);
		})
	}
	private checkForNext(ts:number) {
		let chkLength = 0;
		this.list.forEach(itm=>{
			chkLength += itm.length;
		})
		if(chkLength > 0) {
			if(ts < this.tsForGetData) ts = this.tsForGetData;
			this.wait(2000);
			this.getData(ts);
		} else {
			this.tsForGetData = 0;
		}
	}
	private wait(v:number) {
    // console.log(new Date().toLocaleString());
    const start = new Date().getTime();
    let conter = 1
    while(conter < v) {
      conter = new Date().getTime() - start;
    }
    // console.log(new Date().toLocaleString(), conter);		
	}
	emergencyClose() {
		this.list.forEach((itm) => {
			itm.emergencyClose();
		});
	}
	ReSettleWhenApiServerOn() {
		this.list.forEach((itm) => {
			itm.ReSettleWhenApiServerOn();
		})
	}
}