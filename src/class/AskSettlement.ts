import { AskTable, SendData, ObjectIdentify } from './if';
import SettleProc,{ ApiChannel, ClientChannel } from '../components/SettleProc';
import Credit from '../components/Credit';

export default abstract class AskSettlement {
  protected list:AskTable[]=[];
  protected removelist:AskTable[]=[];
  public static Identify:ObjectIdentify={}
  protected IdentifyCode:string;
  public static LeverKey = 2;
  protected prices:SendData[]=[];
  protected inProcess:boolean=false;
  protected credit:Credit = new Credit();
  constructor(protected Code:string, AskType:number,protected SP:SettleProc){
    this.IdentifyCode = `${Code}${AskType}`;
    AskSettlement.Identify[this.IdentifyCode] = true;
  }
  public Add(ask:AskTable):void{
    let key = ask.AskType;
    if(ask.SetID) key = AskSettlement.LeverKey;
    if(this.IdentifyCode !== `${ask.Code}${key}`) return;
    console.log('Add Ask:', this.IdentifyCode , `${ask.Code}${key}`, ask.id);
    if(ask.ProcStatus >= 2) {
      //this.Remove(ask);
      this.SP.SendAsk(ClientChannel, ask, ask.UserID);
      // this.SP.SendMessage(ClientChannel,JSON.stringify(ask), ask.UserID);
      this.removelist.push(ask);
      return;
    }
    // if(this.list.indexOf(ask) === -1 ) this.list.push(ask);
    const idx = this.list.findIndex(itm=>itm.id === ask.id);
    if(idx === -1) this.list.push(ask);
    else this.list.splice(idx,1,ask);
    // console.log('Add list',this.list);
  }
  public Remove(ask:AskTable):void{
    const idx = this.list.findIndex(itm=>itm.id === ask.id);
    // const idx = this.list.indexOf(ask);
    if( idx !== -1 ) this.list.splice(idx, 1);
    console.log('Remove', this.list.length, JSON.stringify(this.list));
  }
  public RemoveFromList(){
    let chkdo:boolean=false;
    console.log('RemoveFromLise',JSON.stringify(this.removelist));
    this.removelist.forEach((ask)=>{
      this.Remove(ask);
      chkdo=true;
    });
    if(chkdo){
      this.removelist = [];
      this.inProcess = false;
      console.log('RemoveFromList.', this.inProcess, new Date().getTime());    
    } 
  }
  protected Settle(ask:AskTable):boolean {
    ask.ProcStatus = 2;
    return this.SP.SendAsk(ApiChannel, ask, 1);
    // return this.SP.SendMessage(ApiChannel, JSON.stringify(ask), 1);
  }
  public abstract Accept(r:SendData):Promise<void>;
}