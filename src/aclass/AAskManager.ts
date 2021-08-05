import { AskTable, PriceTick, ObjectIdentify } from '../interface/if'; 

export default abstract class AAskManager {
  public static Identify:ObjectIdentify={};
  protected IdentifyCode:string;
	protected list:AskTable[]=[];
	public static LeverKey = 2;
  constructor(protected Code:string, AskType:number){
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
	private removeFromList(ask:AskTable) {
		const fIdx = this.list.findIndex(itm=>itm.id === ask.id);
		if (fIdx > -1) this.list.splice(fIdx, 1);
	}
	private addToList(ask:AskTable) {
		const fIdx = this.list.findIndex(itm=>itm.id === ask.id);
		if (fIdx > -1) this.list.splice(fIdx, 1, ask);
		else this.list.push(ask);
	}
}