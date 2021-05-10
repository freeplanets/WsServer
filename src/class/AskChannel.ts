import WebSocket from 'ws';
import { ChannelT } from './if';

interface WSMemberWithID {
  UserID:number;
  ws:WebSocket;
}

export default class AskChannel implements ChannelT {
  private members:WSMemberWithID[]=[];
  constructor(private name:string,ws:WebSocket,UserID:number){
    this.register(ws,UserID);
  }
  get Name():string {
    return this.name;
  }
  register(ws:WebSocket,UserID:number){
    if(this.members.indexOf({UserID, ws})=== -1) this.members.push({UserID, ws});
  }
  send(message:string, UserID:number){
    try {
      const f = this.members.find(mb => mb.UserID === UserID);
      if(f){
        if(f.ws.readyState === WebSocket.OPEN){
          f.ws.send(message);
        } else {
          const idx = this.members.indexOf(f);
          this.members.splice(idx,1);
        }
      }  
    } catch(err) {
      console.log('AskChannel error', typeof(UserID), err);
    }
  }
}