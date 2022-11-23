import WebSocket from "ws";
import { ATotalManager } from "../aclass/ATotalManager";
// import ChannelManagement from '../class/ChannelManagement';
import ItemManager from './ItemManager';
import { AskTable, WsMsg, ItemInfo, PriceTick } from "../interface/if";
import { FuncKey, Channels } from "../interface/ENum";
import { JsonParse } from './Func';
import MarketTickDB from "./MarketTickDB";

export default class TotalManager extends ATotalManager {
	// private CM: ChannelManagement = new ChannelManagement();
	// private list:ItemManager[]=[];
	private toJSON = JsonParse;
	private mt:MarketTickDB = new MarketTickDB();
	private isInitial = true;
	private pingInterval:NodeJS.Timeout | null = null;
	AcceptMessage(msg:string, ws:WebSocket) {
		const ans = this.toJSON<WsMsg>(msg);
		// console.log('TotalManager AcceptMessage:', JSON.stringify(ans));
		let isEmergencyClose = true;
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
			case FuncKey.DELETE_UNDEALED_ASKS:
				isEmergencyClose = false;
				console.log('FuncKey.DELETE_UNDEALED_ASKS', JSON.stringify(ans));
			case FuncKey.EMERGENCY_CLOSE:
				// console.log(ans.Func);
				this.emergencyClose(ans.Asks, isEmergencyClose);
				break;
			case FuncKey.GET_CRYPTOITEM_CODE_DISTINCT:
				if(ans.data) {
					const items:ItemInfo[] = ans.data;
					this.setItems(items);
				}
				break;
			case FuncKey.GET_UNFINISHED_ASKS:
				// console.log('do:', FuncKey.GET_UNFINISHED_ASKS);
				if(ans.data) {
					this.AddAsk(ans.data, true)
				}
				this.list.map(itm => {
					itm.ReSettleWhenApiServerOn();
				});
				break;
			default:
				this.doNoFunc(ans);
		}
	}
	doNoFunc(wsg:WsMsg) {
		// console.log('doNoFunc:', wsg);
		if (wsg.ChannelName) {
			// console.log('doNoFunc has ChannelName', JSON.stringify(wsg));
			this.SendMessage(wsg.ChannelName, JSON.stringify(wsg));
		} else {
			if(wsg.Ask) {
				// console.log('TT Add Ask:', JSON.stringify(wsg.Ask));
				this.AddSingleAsk(wsg.Ask);
			}
			if(wsg.Asks) {
				// console.log('TT Add Asks:', JSON.stringify(wsg.Asks));
				this.AddAsk(wsg.Asks);
			}
			if(wsg.UserID) {
				console.log('TotalManager', wsg.UserID, new Date().toLocaleString(), JSON.stringify(wsg));
				this.SendMessage(Channels.ASK, JSON.stringify(wsg), wsg.UserID);
				this.SendMessage(Channels.ADMIN, JSON.stringify(wsg), 0);
			} else {
				this.SendMessage(Channels.ADMIN, JSON.stringify(wsg), 0);
				// console.log('welcome:', JSON.stringify(wsg));
			}	
		}
	}
	private AddAsk(ask:AskTable | AskTable[], initAsk = false){
		// console.log('do AddAsk');
		if(Array.isArray(ask)) {
			ask.forEach(itm=>{
				this.AddSingleAsk(itm, initAsk);
			})
		} else {
			this.AddSingleAsk(ask, initAsk);
		}
	}
	private AddSingleAsk(ask:AskTable, initAsk = false) {
		// console.log('do AddSingleAsk');
		this.list.forEach(itmgr=>{
			// console.log('AddAsk', ask);
			itmgr.AddAsk(ask, initAsk);
		});
	}
	private setItems(itms:ItemInfo[]) {
		if (Array.isArray(itms)) {
			itms.forEach(itm=>{
				const f = this.list.find(itmMg => itmMg.Code === itm.Code);
				if (f) {
					f.Update(itm);
				} else {
					this.list.push(new ItemManager(this, itm, this.mt));	
				}
			})
			console.log('list:', this.list.length, itms);
			this.SendForGetAsks();  
		} else {
			console.log('Wrong itms', itms);
		}
	}
  RegisterChannel(name:string, ws:WebSocket, UserID?:number){
    // console.log('TM RegisterChannel:', name, UserID);
		this.CM.Register(name, ws, UserID);
		if(name === Channels.API_SERVER) {
			ws.on('ping', () => {
				console.log('ping');
			})
			ws.on('pong', () => {
				console.log('pong ' + new Date().toLocaleString());
			})
			if (this.pingInterval) {
				console.log('API_SERVER relogin clearInterval' + new Date().toLocaleString());
				clearInterval(this.pingInterval);
			}
			this.pingInterval = setInterval(() => {
				ws.ping();
				const msg:WsMsg = {
					Func: FuncKey.CONNECTION_CHECK,
					Message: new Date().toLocaleString(),
					data: new Date().getTime(),
				}
				this.SendMessage(Channels.ASK, JSON.stringify(msg));
				this.SendMessage(Channels.ADMIN, JSON.stringify(msg));
			}, 45000);
			// When Api_Server set channel send getItems message
			if (this.isInitial) {
				this.SendDeleteUndealedAsks();
				this.isInitial = false;
			} else {
				console.log('not init SendForItemInfo');
				this.SendForItemInfo();
			}
			/*
			this.SendForItemInfo();
			this.list.map(itm => {
				itm.ReSettleWhenApiServerOn();
			});
			*/
		}
  }
  SendAsk(name:string, ask:AskTable, opt?:WebSocket|number):boolean {
    const msg:WsMsg= {
      Ask: ask
    }
    return this.SendMessage(name, JSON.stringify(msg), opt);
  }
	private SendForItemInfo() {
		this.SendFuncKey(FuncKey.GET_CRYPTOITEM_CODE_DISTINCT);
	}
	private SendForGetAsks() {
		this.SendFuncKey(FuncKey.GET_UNFINISHED_ASKS);
	}
	private SendDeleteUndealedAsks() {
		this.SendFuncKey(FuncKey.DELETE_UNDEALED_ASKS);
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
	emergencyClose(asks?:AskTable | AskTable[], isEmergencyClose = true) {
		console.log('emergencyClose', isEmergencyClose);
		if (isEmergencyClose) {
			this.list.forEach((itm) => {
				itm.emergencyClose();
			});
		} else if (!asks) {
			this.SendForItemInfo();
		}
		if(asks) {
			const msg:WsMsg = {};
			if(Array.isArray(asks)) {
				asks.forEach((ask) => {
					msg.Func = isEmergencyClose ? FuncKey.EMERGENCY_CLOSE : FuncKey.DELETE_UNDEALED_ASKS;
					msg.Asks = ask;
					this.SendMessage(Channels.ASK, JSON.stringify(msg), ask.UserID);
				})	
			} else {
				msg.Func = isEmergencyClose ? FuncKey.EMERGENCY_CLOSE : FuncKey.DELETE_UNDEALED_ASKS;
				msg.Asks = asks;
				this.SendMessage(Channels.ASK, JSON.stringify(msg), asks.UserID);
			}
			msg.Asks = asks;
			this.SendMessage(Channels.ADMIN, JSON.stringify(msg), 0);
		}
	}
	SavePriceTick(data:PriceTick[]) {
		const msg:WsMsg = {
			Func: FuncKey.SAVE_PRICETICK,
			data,
		}
		this.SendMessage(Channels.API_SERVER, JSON.stringify(msg), 0);
	}
}