import WebSocket from "ws";
import { ATotalManager } from "../aclass/ATotalManager";
// import ChannelManagement from '../class/ChannelManagement';
import ItemManager from './ItemManager';
import { AskTable, WsMsg, ItemInfo } from "../interface/if";
import { FuncKey, Channels } from "../interface/ENum";
import { JsonParse } from './Func';
import MarketTickDB from "./MarketTickDB";

export default class TotalManager extends ATotalManager {
	// private CM: ChannelManagement = new ChannelManagement();
	// private list:ItemManager[]=[];
	private toJSON = JsonParse;
	private mt:MarketTickDB = new MarketTickDB();
	AcceptMessage(msg:string, ws:WebSocket) {
		const ans = this.toJSON<WsMsg>(msg);
		// console.log('TotalManager AcceptMessage:', JSON.stringify(ans));
		switch(ans.Func) {
			case FuncKey.SET_CHANNEL:
				if (ans.ChannelName) {
					this.RegisterChannel(ans.ChannelName, ws, ans.UserID);
				}
				break;
			case FuncKey.CLIENT_INFO:
				console.log(`AcceptMessage ${ans.Func}`, msg);
				break;
			case FuncKey.MESSAGE:
				if (ans.ChannelName && ans.Message) {
					const channel = ans.ChannelName;
					const message = ans.Message;
					let UserID = 0;
					if (ans.SendTo) {
						if (Array.isArray(ans.SendTo)) {
							ans.SendTo.forEach((id) => {
								this.SendMessage(channel, message, id);
							});
							return;
						} else {
							UserID = ans.SendTo;
						}
					}
					this.SendMessage(ans.ChannelName, ans.Message, UserID);
				};
				break;
			case FuncKey.SAVE_MESSAGE:
				break;
			case FuncKey.EMERGENCY_CLOSE:
				console.log(ans.Func);
				this.emergencyClose();
				break;
			case FuncKey.GET_CRYPTOITEM_CODE_DISTINCT:
				if(ans.data) {
					const items:ItemInfo[] = ans.data;
					this.setItems(items);
				}
				break;
			case FuncKey.GET_UNFINISHED_ASKS:
				if(ans.data) {
					this.AddAsk(ans.data)
				}
				break;
			default:
				this.doNoFunc(ans);
		}
	}
	doNoFunc(wsg:WsMsg) {
		// console.log('doNoFunc:', wsg);
		if(wsg.Ask) {
			this.AddSingleAsk(wsg.Ask);
		}
		if(wsg.Asks) {
			this.AddAsk(wsg.Asks);
		}
		if(wsg.UserID) {
			// console.log('TotalManager', wsg.UserID, JSON.stringify(wsg));
			this.SendMessage(Channels.ASK, JSON.stringify(wsg), wsg.UserID);
			this.SendMessage(Channels.ADMIN, JSON.stringify(wsg), 0);
		} else {
			this.SendMessage(Channels.ADMIN, JSON.stringify(wsg), 0);
			// console.log('welcome:', JSON.stringify(wsg));
		}
	}
	private AddAsk(ask:AskTable | AskTable[]){
		if(Array.isArray(ask)) {
			ask.forEach(itm=>{
				this.AddSingleAsk(itm);
			})
		} else {
			this.AddSingleAsk(ask);
		}
	}
	private AddSingleAsk(ask:AskTable) {
		this.list.forEach(itmgr=>{
			itmgr.AddAsk(ask);
		})
	}
	private setItems(itms:ItemInfo[]) {
		if (Array.isArray(itms)) {
			itms.forEach(itm=>{
				const fIdx = this.list.findIndex(itmMg=>itmMg.Code === itm.Code);
				if(fIdx === -1){
					this.list.push(new ItemManager(this, itm, this.mt));
					// console.log('after add item', this.list.length);
				}
			})
			// console.log('list:', this.list.length);
			this.SendForGetAsks();
		} else {
			console.log('Wrong itms', itms);
		}
	}
  RegisterChannel(name:string, ws:WebSocket, UserID?:number){
    // console.log('TM RegisterChannel:', name, UserID);
    this.CM.Register(name, ws, UserID);
		if(name === Channels.API_SERVER) {
			// When Api_Server set channel send getItems message
			this.SendForItemInfo();
		}		
  }
  SendAsk(name:string, ask:AskTable, opt?:WebSocket|number):boolean {
    const msg:WsMsg= {
      Ask: ask
    }
    return this.SendMessage(name, JSON.stringify(msg), opt);
  }
	private SendForItemInfo() {
		this.SendFuncKey(FuncKey.GET_CRYPTOITEM_CODE_DISTINCT)
	}
	private SendForGetAsks() {
		this.SendFuncKey(FuncKey.GET_UNFINISHED_ASKS)
	}
	private SendFuncKey(fundkey:FuncKey) {
		const wsg:WsMsg = {
			Func: fundkey,
		}
		this.SendMessage(Channels.API_SERVER, JSON.stringify(wsg), 0);
	}
  SendMessage(name:string, message:string, opt?:WebSocket | number):boolean { // ws:WebSocket | UserID
		// console.log('TotalManager SenMessage:', opt);
    return this.CM.Send(name, message, opt )
  }
  RemoveFromChannel(ws:WebSocket):void{
    this.CM.Remove(ws);
  }
	emergencyClose() {
		this.list.forEach((itm) => {
			itm.emergencyClose();
		});
	}
}