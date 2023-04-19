import WebSocket from 'ws';
import { ChannelT, WSMemberWithID } from '../interface/if';

export default class AChannel implements ChannelT {
  private members:WSMemberWithID[]=[];
  private removelist:WSMemberWithID[]=[];
  constructor(private name:string,ws:WebSocket, UserID = 0){
    // this.members.push(ws);
    this.register(ws, UserID);
  }
  get Name():string {
    return this.name;
  }
  register(ws:WebSocket, UserID = 0){
    // console.log('AChannel register', ws);
    const fIdx = this.members.findIndex(itm => itm.UserID === UserID);
    if (fIdx !== -1) {
      // if (this.members[fIdx].ws.readyState !== 1) {
        this.members[fIdx] = {UserID, ws}; 
      // }     
    } else {
      this.members.push({UserID, ws});
    }
    // if(this.members.indexOf(ws) === -1) this.members.push(ws);
    console.log(`Channel ${this.name} member count:`, this.members.length);
  }
  send(message:string, UserID = 0):boolean{
    let doMessage = false;
    // console.log('AChannel send', UserID, message);
    try {
      this.members.forEach((mb)=>{
        // console.log('AChannel :', mb.ws.readyState);
        if (mb.ws.readyState === WebSocket.OPEN) {
          // console.log('AChannel after readyState :', mb.UserID, UserID);
          if (mb.UserID === UserID) {
            // console.log('AChannel after before send :', mb.UserID, message);
            mb.ws.send(message);
            doMessage = true;
          }
          /*
          if (mb) {
            if (mb.ws !== ws) {
              mb.send(message);
              doMessage = true;            
            }
          } else {
            mb.send(message);
          }
          */
        } else {
          this.removelist.push(mb);       
        }
      })
      if(this.removelist.length>0) this.removeMember();
    } catch(err) {
      console.log('AChannel send error:', err);
    }
    return doMessage;
  }
  private removeMember(){
    this.removelist.forEach((rm)=>{
      const idx = this.members.findIndex(itm => itm.UserID === rm.UserID);
      if(idx !==-1) this.members.splice(idx,1);
    });
    this.removelist = [];
  }
  remove(UserID=0):void {
  //  remove(ws:WebSocket):void {
    const idx = this.members.findIndex(itm => itm.UserID === UserID);
    // console.log('AChannels member:',this.members);
    // console.log('AChannels remove:',idx);
    if(idx !== -1) this.members.splice(idx,1);
  }
}
