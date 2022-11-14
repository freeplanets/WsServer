import { IncomingMessage } from "node:http";
import WebSocket from "ws";
import dotenv from 'dotenv';

dotenv.config();

export default abstract class AWebSocket {
	protected server:WebSocket.Server;
	constructor() {
		const port:number = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : 4001;
		const opt: WebSocket.ServerOptions = {
			port
		}
		this.server = new WebSocket.Server(opt);
		this.server.on('error', (ws:WebSocket, error:Error) => {
			console.log('error', error);
		});
		this.server.on('open',(ws:WebSocket)=>{
			console.log('connected:', ws.readyState);	
		});
		/*
		this.server.on('ping',(ws:WebSocket, args:any[]) => {
			console.log('onping', ws.readyState, args);
		});
		this.server.on('pong', (ws:WebSocket, args:any[])=>{
			console.log('onpong', ws.readyState, args);
		});
		*/
		this.server.on('connection',(ws:WebSocket, req:IncomingMessage)=>{
			const ip = req.socket.remoteAddress;
			const port = req.socket.remotePort;
			const curClient = `${ip}:${port}`;
			// console.log('%s is connected',curClient);
			const msg = {
				Message : 'Welcome ' + curClient, 
			}
			ws.send(JSON.stringify(msg));
		
			ws.on('message',(data:WebSocket.Data)=>{
				const strdata = data.toString();
				this.onMessage(strdata, ws);
				/*
				SP.AcceptMessage(strdata, ws);
				ws.on('close',( code:number, reason:string)=>{
					SP.RemoveFromChannel(ws);
				})
				*/
			});
		});
		
		this.server.on('close',(me:WebSocket.Server)=>{
			console.log('disconnected', me);
		});
	}
	protected abstract onMessage(msg:string, ws:WebSocket):void;
}
