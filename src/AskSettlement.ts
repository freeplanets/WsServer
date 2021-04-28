import { AskTable, SendData, ObjectIdentify } from './if';

export default abstract class AskSettlement {
  protected list:AskTable[]=[];
  protected removelist:AskTable[]=[];
  public static Identify:ObjectIdentify={}
  protected IdentifyCode:string;
  constructor(protected Code:string,AskType:number){
    this.IdentifyCode = `${Code}${AskType}`;
    AskSettlement.Identify[this.IdentifyCode] = true;
  }
  public Add(ask:AskTable){
    if(this.IdentifyCode !== `${ask.Code}${ask.AskType}`) return;
    if(this.list.indexOf(ask) === -1 ) this.list.push(ask); 
  }
  public Remove(ask:AskTable){
    const idx = this.list.indexOf(ask);
    if( idx !== -1 ) this.list.splice(idx, 1); 
  }
  public RemoveFromList(){
    this.removelist.forEach((ask)=>{
      this.Remove(ask);
    });
    this.removelist = [];
  }
  public abstract Accept(r:SendData):void;
}