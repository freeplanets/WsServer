import AWS from 'aws-sdk';
// import WebSocket from 'ws';
import config from './config';
import { SendData, ReceivedData, Channels, WsMsg, FuncKey } from '../class/if'
import AskSettlement from '../class/AskSettlement';
import SettleProc from "./SettleProc";
import SettleProcDB from './SettleProcDB';
//import AWSMqttClient from 'aws-mqtt/lib/NodeClient';

const AWSMqttClient	= require('aws-mqtt/lib/NodeClient');

AWS.config.region = config.aws.region;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: config.aws.cognito.identityPoolId,
})
class Mqtt {
  private client;
  private clientId:string;
  private clients:AskSettlement[]=[];
  private chPub = config.topics.announcement;
  private chMe:string;
  constructor(private SP:SettleProc | SettleProcDB, client?:string){
    if(client) this.clientId = client;
    else this.clientId = 'dataprovider@kingbet';
    this.chMe = `${config.topics.room}${this.clientId}`; 
    this.client = new AWSMqttClient({
      region: AWS.config.region,
      credentials: AWS.config.credentials,
      endpoint: config.aws.iot.endpoint,
      clientId: this.clientId,
      will: {
        topic: config.topics.room + this.clientId,			// 離線時 發佈 leave 至私人頻道
        payload: 'leave',
        qos: 0,
        retain: false
      } 
    });
    this.client.on('connect', () => {
      this.addLogEntry('Successfully connected to AWS MQTT Broker!:-)')
      this.subscribe(config.topics.announcement)				// 訂閱 公告頻道
      this.subscribe(config.topics.tick)					// 訂閱 報價頻道
      this.subscribe(this.chMe)			// 訂閱 私人頻道 可發佈訊息
      // this.client.publish(this.chMe, 'enter')	// 連線成功時 發佈 enter 訊息至私人頻道
      this.publish(this.chMe, 'enter');
      /*
      const wsg:WsMsg = {
        Func: FuncKey.SET_CHANNEL,
        ChannelName: this.chMe,
        UserID: 0
      }
      this.client.publish(this.chPub,JSON.stringify(wsg));
      */
    })
    this.client.on('message', async (topic:string, message:string) => {
      if(topic === this.chPub ) {
        this.addLogEntry(`on meseage: ${topic} => ${message}`);
      }
      const data:ReceivedData|undefined = this.JsonParse(message);
      if(data){
        const senddata:SendData = {
          eventTime: data.eventTime,
          symbol: data.symbol,
          currentClose: data.currentClose,
          closeQuantity: data.closeQuantity,
          open: data.open,
        }
        await this.send(senddata);  
      }
      //const sendMsg = JSON.stringify(senddata);
      //this.send(sendMsg);
    })
    
    this.client.on('close', () => {
      this.addLogEntry('Closed:-(')
    })
    
    this.client.on('offline', () => {
      this.addLogEntry('Went offline:-(')
    })
  }
  publish(topic:string,message:string) {
    this.addLogEntry(`publish: ${topic} => ${message}`);
    this.client.publish(topic, message);
  }
  JsonParse(str:string, key?:number):ReceivedData|undefined{
    try {
      return JSON.parse(str);
    } catch(err) {
      const tmp:any = str;
      const newstr = String.fromCharCode.apply(null, tmp);
      if(newstr === 'leave') return;
      console.log('JSON Parse Error:', str, err);
      /*
      if(!key){
        const tmp:any = str;
        const newstr = String.fromCharCode.apply(null, tmp);
        return this.JsonParse(newstr,1);
      }
      */
      return;
    }
  }
  async send(data:SendData):Promise<void> {
    this.SP.getPrice(data);
    /*
    this.clients.forEach(async (elm:AskSettlement)=>{
      await elm.Accept(data);
    });
    */
  }
  AddClinet(clt:AskSettlement){
    this.clients.push(clt)
  }
  RemoveClient(clt:AskSettlement){
    const idx = this.clients.indexOf(clt);
    if(idx !== -1) this.clients.splice(idx, 1); 
  }
  set Clients(clt:AskSettlement[]){
    this.clients = clt;
  }
  subscribe(topic:string) {
    this.client.subscribe(topic)
    this.addLogEntry(`subscribe to ${topic}`)
  }
  
  addLogEntry(info:string) {
    console.log(info)
  }
}
export default Mqtt;