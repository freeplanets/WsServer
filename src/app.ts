import WebSocket, { Data, ServerOptions } from 'ws';
// import SettleProc from './components/SettleProc';
import { WsMsg } from './interface/if';
import TotalManager from './class/TotalManager';
import { IncomingMessage } from 'http';

// const SP = new SettleProc(process.env.MATT_USER);
// SP.getAsks();
// let SP:SettleProc;
const ttMg = new TotalManager();

const port:number = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : 4001;

const options:ServerOptions = {
  port: port,
}
console.log('port:',options);
const server = new WebSocket.Server(options)
// console.log('defaultMaxListeners:', server.getMaxListeners());
server.setMaxListeners(100);
// console.log('defaultMaxListeners:', server.getMaxListeners());
server.on('error',(ws:WebSocket,error:Error)=>{
  const maxltner = ws.getMaxListeners();
  console.log('MaxListeners', maxltner);
  console.log('error:', error);
})

server.on('open',(ws:WebSocket)=>{
  console.log('connected', ws.readyState);
});

server.on('connection',(ws:WebSocket, req:IncomingMessage)=>{
  const ip = req.socket.remoteAddress;
  const port = req.socket.remotePort;
  const curClient = `${ip}:${port}`;
  console.log('%s is connected',curClient);
  const msg:WsMsg = {
    Message : 'Welcome ' + curClient, 
  }
  ws.send(JSON.stringify(msg));

  ws.on('message',(data:Data)=>{
    const strdata = data.toString();
    // SP.AcceptMessage(strdata, ws);
    ttMg.AcceptMessage(strdata, ws);
    ws.on('close',( code:number, reason:string)=>{
      // SP.RemoveFromChannel(ws);
      ttMg.RemoveFromChannel(ws);
    })
  });
});

server.on('close',(me:WebSocket.Server)=>{
  console.log('disconnected', me);
});


/*
*/

