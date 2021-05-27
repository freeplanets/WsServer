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
    const idx = this.members.indexOf({ UserID, ws });
    if( idx === -1) this.members.push({ UserID, ws });
    else this.members.splice(idx, 1, { UserID, ws })
  }
  send(message:string, UserID:number):boolean{
    let doMessage = false;
    try {
      const f = this.members.find(mb => mb.UserID === UserID);
      console.log('check1', this.members.length, UserID, f);
      if(f){
        console.log('check2');
        if(f.ws.readyState === f.ws.OPEN){
          console.log('check3');
          f.ws.send(message);
          doMessage = true;
        } else {
          const idx = this.members.indexOf(f);
          this.members.splice(idx,1);
        }
      } else {
        this.members.forEach(itm=>{
          console.log('list ws:', this.Name, itm.UserID);
        })
      }  
    } catch(err) {
      console.log('AskChannel error', typeof(UserID), err);
    }
    return doMessage;
  }
  remove(ws:WebSocket):void {
    this.members.every((itm,idx)=>{
      if(itm.ws === ws) {
        console.log('AskChannels remove', itm.UserID, idx);
        this.members.splice(idx,1);
        return false;
      }
    });
  }  
}