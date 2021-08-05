import WebSocket from 'ws';
// import { ChannelT } from '../interface/if'
import ChannelManagement from '../class/ChannelManagement';
import ItemManager from '../class/ItemManager';

export abstract class ATotalManager {
	protected list:ItemManager[]=[];
	protected CM: ChannelManagement = new ChannelManagement();
	constructor(){}
	abstract AcceptMessage(msg:string, ws:WebSocket):void;
	protected abstract RegisterChannel(name:string, ws:WebSocket, UserID?:number):void;	
	abstract RemoveFromChannel(ws:WebSocket):void;
}