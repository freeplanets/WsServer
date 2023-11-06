import WebSocket, { Data, ClientOptions } from 'ws';
import dotenv from 'dotenv';
import MsgManager from './MsgManager';
import {Channels} from '../interface/ENum';
import { WsMsg } from '../interface/if';
import { ClientRequest, IncomingMessage } from 'node:http';

dotenv.config();

//const wsHost =  process.env.WS_SERVER === "localhost:4001" ? `ws://${process.env.WS_SERVER}` : `wss://${process.env.WS_SERVER}`;
const wsHost =  `ws://${process.env.WS_SERVER}`;
const sitename = process.env.SITE_NAME ? process.env.SITE_NAME : "Crypto";
const wsOptions: ClientOptions = {
  // localAddress: 'localhost',
};
const ChannelName = Channels.API_SERVER;
const wsSERVER = `${wsHost}/${sitename}/${ChannelName}/SettleMan`;

export class WsClient {
  get isConnected() {
    if (!this.ws) { return false; }
    return this.ws.readyState === this.ws.OPEN;
  }
  private ws!: WebSocket;
  private ttMg!: MsgManager;
  constructor(private url: string, private opts: ClientOptions) {
    // console.log('WsClient',url,opts)
    // this.ws = this.createConnection();
    this.createConnection();
  }
  public SendMessage(msg: string) {
    if (this.ws.readyState === WebSocket.OPEN) {
      // console.log("Send Mesage to Server:", msg);
      const wsmsg: WsMsg = {
        Message: msg,
      };
      this.ws.send(JSON.stringify(wsmsg));
    }
  }
  public Send(msg: WsMsg) {
    // console.log("before Send Mesage:", msg);
    if (!this.isConnected) { return; }
    // console.log("Send Mesage:", msg);
    // this.ws.send(msg);
    try {
      this.ws.send(JSON.stringify(msg));
    } catch (err) {
      console.log("WsClient Send error:", err);
    }
  }
  public Close() {
      if (this.ws.readyState !== this.ws.OPEN) {
        console.log("wait Server connected.....", this.ws.readyState, this.ws.OPEN);
      } else {
        console.log("disconnect....");
        this.ws.close();
        console.log("done");
      }
  }
  private createConnection() {
    console.log("create connection!!", wsSERVER);
    this.ws = new WebSocket(this.url, this.opts);
    this.ws.on("error", (data) => {
      console.log("createConnection error:", data.message);
    });
    this.ws.on("disconnect", (data) => {
      console.log("disconnect:", data);
    });
    this.ws.on("open", () => {
      console.log("WS connected:");
      console.log("status", this.ws.readyState, this.ws.OPEN);
      this.SendMessage("First Message");
      this.ttMg = new MsgManager(this);
      // this.registerChannel(ChannelName);
    });
    this.ws.on("message", async (data:Data) => {
      // console.log("message from WS:", data);
      this.ttMg.AcceptMessage(data.toString());
    });
    // ws.on("ping", this.heartbeat);
    // ws.on("pong", this.heartbeat);
    this.ws.on("close", () => {
      console.log("connection close.");
      const me = this;
      setTimeout(() => {
        console.log("do reconnect");
        me.createConnection();
      }, 5000);
    });
    this.ws.on('unexpected-response', (ws: WebSocket, request: ClientRequest, response: IncomingMessage) => {
      console.log('ClientRequest', ws.readyState);
      console.log('request:', request);
      console.log('response:', response);
    })
  }
}
new WsClient(wsSERVER, wsOptions);
