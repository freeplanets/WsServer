import WebSocket from 'ws';
import { ChannelT } from '../interface/if';

export default class AChannel implements ChannelT {
  private members:WebSocket[]=[];
  private removelist:WebSocket[]=[];
  constructor(private name:string,ws:WebSocket){
    // this.members.push(ws);
    this.register(ws);
  }
  get Name():string {
    return this.name;
  }
  register(ws:WebSocket){
    if(this.members.indexOf(ws) === -1) this.members.push(ws);
    // console.log(`Channel ${this.name} member count:`, this.members.length);
  }
  send(message:string, ws?:WebSocket):boolean{
    let doMessage = false;
    try {
      this.members.forEach((mb)=>{
        if(mb.readyState === WebSocket.OPEN){
          if(ws) {
            if(mb !== ws){
              mb.send(message);
              doMessage = true;            
            }
          } else {
            mb.send(message);
          }
        } else {
          this.removelist.push(mb);       
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
