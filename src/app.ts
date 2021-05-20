import dotenv from 'dotenv';
import SettleProc from './components/SettleProc';
import { IncomingMessage } from 'node:http';
import WebSocket from 'ws';

dotenv.config()
const SP = new SettleProc(process.env.MATT_USER);
SP.getAsks();
// let SP:SettleProc;

const port:number = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : 4001;
const options:WebSocket.ServerOptions = {
  port: port,
}
console.log('port:',options);
const server = new WebSocket.Server(options)

server.on('error',(ws:WebSocket,error:Error)=>{
  console.log('error:',error);
})

server.on('open',(ws:WebSocket)=>{
  console.log('connected', ws.readyState);
});

server.on('connection',(ws:WebSocket, req:IncomingMessage)=>{
  const ip = req.socket.remoteAddress;
  const port = req.socket.remotePort;
  const curClient = `${ip}:${port}`;
  // console.log('connection:',req.socket);
  console.log('%s is connected',curClient);
  // mqtt.Clients = server.clients;
  ws.send('Welcome ' + curClient);

  ws.on('message',(data:WebSocket.Data)=>{
    //console.log('data:',data,typeof data);
    const strdata = data.toString(); 
    console.log('received: %s from %s', strdata, curClient);
    const find = strdata.search('SetChannel');
    if (find === -1) {
      const tmpAsk = SP.JsonParse(strdata);
      if(tmpAsk){
        SP.pushAsk(tmpAsk);
      }
    } else {
      const chInfo = strdata.split(':');  // SetChannel:channelName:?UserID
      const chname = chInfo[1];
      const UserID:number = chInfo[2] ? parseInt(chInfo[2]) : 0;
      console.log('Create Channel:', chname);
      if(chname){
        SP.RegisterChannel(chname, ws, UserID);
      }
    }
    ws.on('close',( code:number, reason:string)=>{
      SP.RemoveFromChannel(ws);
      //console.log(`client close =>  ${code},${reason},${ws.readyState}`);
    })
    /*
    server.clients.forEach((client:WebSocket)=>{
      if (client.readyState === WebSocket.OPEN) {
        client.send(curClient + ' -> ' + strdata );
      }
    });
    */
  });
});

server.on('close',(me:WebSocket.Server)=>{
  console.log('disconnected', me);
});
