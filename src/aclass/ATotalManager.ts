import WebSocket from 'ws';
import { AskTable, PriceTick, WsMsg } from '../interface/if'
import ChannelManagement from '../class/ChannelManagement';
import ItemManager from '../class/ItemManager';
import { Channels, FuncKey } from '../interface/ENum';

export abstract class ATotalManager {
	protected list:ItemManager[]=[];
	protected CM: ChannelManagement = new ChannelManagement();
	private intervalID:NodeJS.Timeout;
	constructor(){
		this.intervalID = setInterval(() => {
			this.ServerInfo()
		}, 1000);
	}
	abstract AcceptMessage(msg:string, ws:WebSocket):void;
	// protected abstract RegisterChannel(name:string, ws:WebSocket, UserID?:number):void;	
	// abstract RemoveFromChannel(ws:WebSocket):void;
	abstract SendAsk(name:string, ask:AskTable):boolean;
	abstract SavePriceTick(data:PriceTick[]):void;
	private ServerInfo() {
		if (this.intervalID) {
			const tmp:WsMsg = {
				Func: FuncKey.MESSAGE,
				data: new Date().toUTCString()
			}
			// console.log('ServerInfo', JSON.stringify(tmp));
			this.CM.Send(Channels.ADMIN, JSON.stringify(tmp));	
		}
	}
}