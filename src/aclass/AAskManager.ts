import { AskTable, PriceTick, ObjectIdentify } from '../interface/if';
import { Channels } from '../interface/ENum';
// import TotalManager from '../class/TotalManager';
import { ATotalManager } from './ATotalManager';

export default abstract class AAskManager {
  public static Identify:ObjectIdentify={};
  protected IdentifyCode:string;
	protected list:AskTable[]=[];
	protected settleList:AskTable[]=[];
	public static LeverKey = 2;
  constructor(protected TM:ATotalManager, protected Code:string, AskType:number){
    this.IdentifyCode = `${Code}${AskType}`;
    AAskManager.Identify[this.IdentifyCode] = true;
  }
	Add(ask:AskTable) {
		// if (ask.ItemID !== this.ItemID ) return;
		console.log(this.IdentifyCode, ask.id, ask.AskType,ask.Code, ask.UserID);
		if (ask.ProcStatus > 1 ) this.removeFromList(ask);
		else this.addToList(ask);
	}
	get length() {
		return this.list.length;
	}
	abstract AcceptPrice(priceTick:PriceTick):void;
	abstract emergencyClose():void;
	private removeFromList(ask:AskTable) {
		// console.log(`${this.IdentifyCode} removeFromList:`, this.list.length, this.settleList.length, JSON.stringify(ask));
		this.removeFromAskArray(ask, this.list);
		this.removeFromAskArray(ask, this.settleList);
		// console.log(`${this.IdentifyCode} removeFromList:`, ask.id, this.list.length, this.settleList.length);
	}
	private addToList(ask:AskTable) {
		//const fIdx = this.list.findIndex(itm=>itm.id === ask.id);
		//if (fIdx > -1) this.list.splice(fIdx, 1, ask);
		//else this.list.push(ask);
		this.addToAskArray(ask, this.list);
	}
	private addToAskArray(ask:AskTable, list:AskTable[]){
		const fIdx = list.findIndex(itm=>itm.id === ask.id);
		if (fIdx > -1) list.splice(fIdx, 1, ask);
		else this.list.push(ask);		
	}
	private removeFromAskArray(ask:AskTable, list:AskTable[]) {
		const fIdx = list.findIndex(itm=>itm.id === ask.id);
		if (fIdx > -1) list.splice(fIdx, 1);	
	}
	private SettleListChk(ask:AskTable):boolean {
		let chk = false;
		const f = this.settleList.find(itm=>itm.id === ask.id);
		if(f) {
			if(f.DealTime && ask.DealTime) {
				if ((ask.DealTime - f.DealTime) > 2000){
					ask = f;
					// chk = true;
					console.log(`${this.IdentifyCode} SettleListChk:`, ask.id, ask.ProcStatus, JSON.stringify(ask));
					this.TM.SendAsk(Channels.API_SERVER, ask);					
				}
			}
		} else {
			this.settleList.push(ask);
			chk = true;
		}
		return chk;
	}
  protected Settle(ask:AskTable):void {
    ask.ProcStatus = 2;
		if(this.SettleListChk(ask)) {
			console.log(`${this.IdentifyCode} Settle:`, ask.id, JSON.stringify(ask));
			this.TM.SendAsk(Channels.API_SERVER, ask);
		}
    // return this.SP.SendAsk(ApiChannel, ask, 1);
    // return this.SP.SendMessage(ApiChannel, JSON.stringify(ask), 1);
  }
	ReSettleWhenApiServerOn() {
		this.settleList.map(ask => {
			console.log(`${this.IdentifyCode} Resettle when api serve no`, ask.id, JSON.stringify(ask));
			this.TM.SendAsk(Channels.API_SERVER, ask);
		})
	}	
}