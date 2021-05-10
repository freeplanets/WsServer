import WebSocket from 'ws';
import { ChannelT } from './if';

export default class AChannel implements ChannelT {
  private members:WebSocket[]=[];
  private removelist:WebSocket[]=[];
  constructor(private name:string,ws:WebSocket){
    this.members.push(ws);
  }
  get Name():string {
    return this.name;
  }
  register(ws:WebSocket){
    if(this.members.indexOf(ws)===-1) this.members.push(ws);
  }
  send(message:string, ws:WebSocket){
    try {
      this.members.forEach((mb)=>{
        if(mb !== ws){
          if(mb.readyState === WebSocket.OPEN){
            mb.send(message);
          } else {
            this.removelist.push(mb);       
          }
        }
      })
      if(this.removelist.length>0) this.removeMember;
    } catch(err) {
      console.log('AChannel send error:', typeof(ws), err);
    }
  }
  private removeMember(){
    this.removelist.forEach((rm)=>{
      const idx = this.members.indexOf(rm);
      if(idx !==-1) this.members.splice(idx,1);
    });
    this.removelist = [];
  }
}
