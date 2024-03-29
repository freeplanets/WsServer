import WebSocket,{ Data, ServerOptions } from 'ws';
// import SettleProc from './components/SettleProc';
import { WsMsg } from './interface/if';
import TotalManager from './class/TotalManager';
import { IncomingMessage } from 'http';
import { exec, ExecException } from 'child_process';

// const SP = new SettleProc(process.env.MATT_USER);
// SP.getAsks();
// let SP:SettleProc;
exec('node -v', (err:ExecException | null, stdout:string, stderr:string) => {
  if (err) {
    console.log('ExecException', err);
  } else if (stderr) {
    console.log('Error', stderr);
  } else {
    console.log('node version:', stdout);
  }
});
const ttMg = new TotalManager();

const port:number = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : 4001;

const options:ServerOptions = {
  port: port,
  clientTracking: true,
}
console.log('port:',options, 'version: v0.051');
const server = new WebSocket.Server(options)
console.log('defaultMaxListeners:', server.getMaxListeners());
// server.setMaxListeners(50);
// console.log('defaultMaxListeners:', server.getMaxListeners());

server.on('error',(ws:WebSocket,error:Error)=>{
  const maxltner = ws.getMaxListeners();
  console.log('MaxListeners', maxltner);
  console.log('error:', error);
})

server.on('open',(ws:WebSocket)=>{
  console.log('open', ws.readyState);
});

server.on('connection',(ws:WebSocket, req:IncomingMessage)=>{
  const ip = req.socket.remoteAddress;
  const port = req.socket.remotePort;
  const curClient = `${ip}:${port}`;
  console.log('%s is connected',curClient);
  // console.log('connected', req.socket);
  const msg:WsMsg = {
    Message : 'Welcome ' + curClient, 
  }
  ws.send(JSON.stringify(msg));
  ws.on('message',(data:Data)=>{
    // console.log('server onmessage check', new Date().toLocaleString(), server.clients.size);
    const strdata = data.toString();
    // SP.AcceptMessage(strdata, ws);
    // console.log(curClient, strdata);
    ttMg.AcceptMessage(strdata, ws);
  });
  ws.on('close',(chk:any)=>{
    console.log('%s %s state:%s is closed', curClient, chk, ws.readyState);
  });
});

server.on('close',(me:WebSocket.Server)=>{
  console.log('disconnected', me);
});


/*
*/

