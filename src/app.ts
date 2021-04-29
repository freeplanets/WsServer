import dotenv from 'dotenv';
// import SettleProc from './components/SettleProc';
import { IncomingMessage } from 'node:http';
import WebSocket from 'ws';

dotenv.config()
// const SP = new SettleProc();
// let SP:SettleProc;

const port:number = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : 3001;
const options:WebSocket.ServerOptions = {
  port: port,
}
console.log('options:',options);
const server = new WebSocket.Server(options)

server.on('open',(arg?:any)=>{
  console.log('connected', arg);
});
server.on('close',(me:WebSocket.Server)=>{
  console.log('disconnected', me);
})

server.on('connection',(ws:WebSocket,req:IncomingMessage)=>{
  const ip = req.socket.remoteAddress;
  const port = req.socket.remotePort;
  const curClient = `${ip}:${port}`;
  //console.log('connection:',req);
  console.log('%s is connected',curClient);
  // mqtt.Clients = server.clients;
  ws.send('Welcome ' + curClient);

  ws.on('message',(data:WebSocket.Data)=>{
    console.log('data:',data);
    console.log('received: %s from %s', data.toString(), curClient);
    server.clients.forEach((client:WebSocket)=>{
      if (client.readyState === WebSocket.OPEN) {
        client.send(curClient + ' -> ' + data.toString());
      }
    });
  });

});