import { ChannelT } from './if';
import AChannel from './AChannel';
import AskChannel from './AskChannel';

export default class ChannelManagement {
  private childs:ChannelT[]=[];
  constructor(){}
  Register(name:string,ws:WebSocket,UserID?:number){
    let f = this.childs.find(chd => chd.Name === name);
    if(f){
      f.register(ws);
    } else {
      if(UserID){
        f = new AskChannel(name, ws, UserID);
      } else {
        f = new AChannel(name, ws);
      }
      this.childs.push(f);
    }
  }
  Send(name:string, message:string, opt:WebSocket | number){
    const f = this.childs.find(chd => chd.Name === name);
    if(f){
      f.send(message, opt);
    }
  }
}