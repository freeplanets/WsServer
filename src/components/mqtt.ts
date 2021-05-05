import AWS from 'aws-sdk';
// import WebSocket from 'ws';
import config from './config';
import { SendData, ReceivedData } from '../class/if'
import AskSettlement from '../class/AskSettlement';
import SettleProc from "./SettleProc";
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
  constructor(private SP:SettleProc){
    this.clientId = 'dataprovider@kingbet';
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
      this.subscribe(config.topics.room + this.clientId)			// 訂閱 私人頻道 可發佈訊息
      this.client.publish(config.topics.room + this.clientId, 'enter')	// 連線成功時 發佈 enter 訊息至私人頻道
    })
    this.client.on('message', async (topic:string, message:string) => {
      //this.addLogEntry(`${topic} => ${message}`)
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
  JsonParse(str:string, key?:number):ReceivedData|undefined{
    try {
      return JSON.parse(str);
    } catch(err) {
      console.log('JSON Parse Error:', str, err);
      if(!key){
        const tmp:any = str;
        const newstr = String.fromCharCode.apply(null, tmp);
        return this.JsonParse(newstr,1);
      }
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