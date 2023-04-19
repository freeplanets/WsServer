import WebSocket from 'ws';
import { ChannelT, WSMemberWithID } from '../interface/if';

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
    // console.log(`Channel ${this.name} member countB:`, this.members.length);
    /*
    this.members.forEach(itm=>{
      console.log(`${this.name} list ws:`, itm.UserID);
    })
    */
    const f = this.members.find(mb=>mb.UserID === UserID);
    if (f) {
      // if(f.ws.readyState !== f.ws.OPEN) {
        f.ws = ws;
        // console.log(`Channel ${this.name} change ws`, UserID);
      //}
    } else {
      this.members.push({ UserID, ws });
    }
    // console.log(`Channel ${this.name} member countA:`, this.members.length);
    /*
    this.members.forEach(itm=>{
      console.log(`${this.name} list ws:`, itm.UserID);
    })
    */
  }
  send(message:string, UserID?:number):boolean {
    // console.log(`Channel ${this.name} Send:`, UserID, message);
    if(UserID) return this.SendToSomeOne(message, UserID);
    return this.SendToAll(message);
  }
  private SendToSomeOne(message:string, UserID:number):boolean {
    let doMessage = false;
    try {
      const f = this.members.find(mb => mb.UserID === UserID);
      if(f){
        // console.log('check2');
        console.log('check1', this.members.length, UserID);       
        if(f.ws.readyState === f.ws.OPEN){
          // console.log('check3', message, typeof(message));
          f.ws.send(message);
          doMessage = true;
        } else {
          const idx = this.members.indexOf(f);
          this.members.splice(idx,1);
        }
      } else {
        console.log(`AskChannel User:${UserID} offline!`);
      }  
    } catch(err) {
      console.log('AskChannel error', typeof(UserID), err);
    }
    return doMessage;
  }
  SendToAll(message:string):boolean {
    try {
      const tmp:number[] = [];
      this.members.forEach((mbr, idx)=>{
        // console.log('SendToAll:', this.Name, mbr.UserID, message);
        if(mbr.ws.readyState === WebSocket.OPEN){
          mbr.ws.send(message);
        } else {
          console.log(`${mbr.UserID} closed!!!`);
          tmp.push(idx);
        }
      });
      while(tmp.length > 0) {
        const p = tmp.pop();
        if (p !== undefined) {
          this.members.splice(p,1);
        }
      }
      return true;
    } catch(err) {
      console.log('AskChannel SendToAll err:', err);
      return false;
    }
  }
  remove(UserID:number):void {
    const idx = this.members.findIndex(itm=> itm.UserID === UserID);
    if (idx !== -1) this.members.splice(idx,1);
    /*
    this.members.every((itm,idx)=>{
      if(itm.UserID === UserID) {
        // console.log('AskChannels remove', itm.UserID, idx);
        this.members.splice(idx,1);
        return false;
      }
    });
    */
  }  
}