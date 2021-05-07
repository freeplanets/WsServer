import dotenv from 'dotenv';
import SettleProc from './components/SettleProc';
import { IncomingMessage } from 'node:http';
import WebSocket from 'ws';

dotenv.config()
const SP = new SettleProc();
SP.getAsks();
// let SP:SettleProc;

const port:number = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : 3001;
const options:WebSocket.ServerOptions = {
  port: port,
}

const noop = () => {};
const heartbeat = (ws:WebSocket,data:Buffer) => {
   const str = String.fromCharCode.apply(null, data.toJSON().data);
   console.log('heartbeat', ws.readyState, str); 
};

const server = new WebSocket.Server(options)

server.on('open',(arg?:any)=>{
  console.log('connected', arg);
});

server.on('connection',(ws:WebSocket,req:IncomingMessage)=>{
  ws.on('pong', heartbeat);
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
      console.log('Create Channel:',strdata.split(':')[1]);
    } 
    /*
    server.clients.forEach((client:WebSocket)=>{
      if (client.readyState === WebSocket.OPEN) {
        client.send(curClient + ' -> ' + strdata );
      }
    });
    */
  });
});

const interval = setInterval(()=>{
  server.clients.forEach((ws)=>{
    if(ws.readyState === WebSocket.OPEN ) ws.terminate();
    ws.ping(noop);
  });
},30000);

server.on('close',(me:WebSocket.Server)=>{
  console.log('disconnected', me);
  clearInterval(interval);
});
