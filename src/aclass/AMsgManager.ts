import WebSocket from 'ws';
import { AskTable } from '../interface/if'
import ChannelManagement from '../class/ChannelManagement';
import ItemManager from '../class/ItemManager';

export abstract class AMsgManager {
	protected list:ItemManager[]=[];
	protected CM: ChannelManagement = new ChannelManagement();
	constructor(){}
	abstract AcceptMessage(msg:string, ws:WebSocket):void;
	protected abstract RegisterChannel(name:string, ws:WebSocket, UserID?:number):void;	
	abstract RemoveFromChannel(ws:WebSocket):void;
	abstract SendAsk(name:string, ask:AskTable, opt?:WebSocket|number):boolean;
}