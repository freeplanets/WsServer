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
    /*
    const idToCancel:number[]=[];
    this.members.forEach((itm,idx)=>{
      if(itm.ws.readyState !== itm.ws.OPEN) idToCancel.push(idx);
    })
    idToCancel.sort(function(a,b) { return b-a; });
    idToCancel.forEach(idx=>{
      this.members.splice(idx,1);
    });
    this.members.push({ UserID, ws });
    */
    console.log('AskChannel member countB:', this.members.length);
    this.members.forEach(itm=>{
      console.log('list ws:', this.Name, itm.UserID);
    })
    const f = this.members.find(mb=>mb.UserID === UserID);
    if (f) {
      if(f.ws.readyState !== f.ws.OPEN) {
        f.ws = ws;
        console.log('AskChannel change ws', UserID);
      }
    } else {
      this.members.push({ UserID, ws });
    }
    console.log('AskChannel member countA:', this.members.length);
    this.members.forEach(itm=>{
      console.log('list ws:', this.Name, itm.UserID);
    })
  }
  send(message:string, UserID?:number):boolean {
    // console.log('AskChannel Send', message, UserID);
    if(UserID) return this.SendToSomeOne(message, UserID);
    return this.SendToAll(message);
  }
  private SendToSomeOne(message:string, UserID:number):boolean {
    let doMessage = false;
    try {
      const f = this.members.find(mb => mb.UserID === UserID);
      // console.log('check1', this.members.length, UserID);
      if(f){
        // console.log('check2');
        if(f.ws.readyState === f.ws.OPEN){
          // console.log('check3');
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
  SendToAll(message:string):boolean {
    try {
      this.members.forEach(mbr=>{
        // console.log('SendToAll:', this.Name, mbr.UserID, message);
        if(mbr.ws.readyState === WebSocket.OPEN){
          mbr.ws.send(message);
        } else {
          console.log(`${mbr.UserID} closed!!!`);
        }
      })
      return true;
    } catch(err) {
      console.log('AskChannel SendToAll err:', err);
      return false;
    }
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