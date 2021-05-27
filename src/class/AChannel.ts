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
    const idx = this.members.indexOf(ws);
    if(idx === -1) this.members.push(ws);
    else this.members.splice(idx, 1, ws);
  }
  send(message:string, ws:WebSocket):boolean{
    let doMessage = false;
    try {
      this.members.forEach((mb)=>{
        if(mb !== ws){
          if(mb.readyState === WebSocket.OPEN){
            mb.send(message);
            doMessage = true;
          } else {
            this.removelist.push(mb);       
          }
        }
      })
      if(this.removelist.length>0) this.removeMember;
    } catch(err) {
      console.log('AChannel send error:', typeof(ws), err);
    }
    return doMessage;
  }
  private removeMember(){
    this.removelist.forEach((rm)=>{
      const idx = this.members.indexOf(rm);
      if(idx !==-1) this.members.splice(idx,1);
    });
    this.removelist = [];
  }
  remove(ws:WebSocket):void {
    const idx = this.members.indexOf(ws);
    // console.log('AChannels member:',this.members);
    // console.log('AChannels remove:',idx);
    if(idx !== -1) this.members.splice(idx,1);
  }
}
