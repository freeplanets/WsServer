import WebSocket from 'ws';
import { ChannelT } from '../interface/if';
import AChannel from './AChannel';
import AskChannel from './AskChannel';

export default class ChannelManagement {
  private childs:ChannelT[]=[];
  constructor(){}
  Register(name:string, ws:WebSocket, UserID?:number){
    let f = this.childs.find(chd => chd.Name === name);
    if(f){
      // console.log('Register Check1');
      f.register(ws, UserID);
    } else {
      // console.log('Register Check2');
      if(UserID){
        // console.log('Register Check3');
        f = new AskChannel(name, ws, UserID);
      } else {
        // console.log('Register Check4');
        f = new AChannel(name, ws, UserID);
      }     
      this.childs.push(f);
      // console.log('Register Check5', this.childs.length); 
    }
    /*
    console.log('TotalChannels:', this.childs.length);
    this.childs.forEach(mb=>{
      console.log('Total Channel Name:', mb.Name)
    })
    */
  }
  Send(ChannelName:string, message:string, opt?:WebSocket | number):boolean{
    let doSend = false;
    const f = this.childs.find(chd => chd.Name === ChannelName);
    if(f){
      // console.log('ChannelManagement send', ChannelName, message, opt, `<${this.childs.length}>`);
      doSend = f.send(message, opt);
    }
    return doSend;
  }
  Remove(UserID:number):void {
  // Remove(ws:WebSocket):void {
    this.childs.forEach((chs)=>{
      chs.remove(UserID);
    })
  }
}