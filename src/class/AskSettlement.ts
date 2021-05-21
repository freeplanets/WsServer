import { AskTable, SendData, ObjectIdentify } from './if';
import SettleProc from '../components/SettleProc';
import Credit from '../components/Credit';

const ApiChannel = 'AskCreator';

export default abstract class AskSettlement {
  protected list:AskTable[]=[];
  protected removelist:AskTable[]=[];
  public static Identify:ObjectIdentify={}
  protected IdentifyCode:string;
  protected prices:SendData[]=[];
  protected inProcess:boolean=false;
  protected credit:Credit = new Credit();
  constructor(protected Code:string, AskType:number,protected SP:SettleProc){
    this.IdentifyCode = `${Code}${AskType}`;
    AskSettlement.Identify[this.IdentifyCode] = true;
  }
  public Add(ask:AskTable):void{
    let key = ask.AskType;
    if(ask.SetID || ask.USetID) key = 2
    console.log('Add Ask:', this.IdentifyCode ,`${ask.Code}${key}`);
    if(this.IdentifyCode !== `${ask.Code}${key}`) return;
    if(ask.ProcStatus > 2) {
      //this.Remove(ask);
      this.removelist.push(ask);
      return;
    }
    if(this.list.indexOf(ask) === -1 ) this.list.push(ask);
    // console.log('Add list',this.list);
  }
  public Remove(ask:AskTable):void{
    const idx = this.list.indexOf(ask);
    if( idx !== -1 ) this.list.splice(idx, 1); 
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
  protected Settle(ask:AskTable):void {
    ask.ProcStatus = 2;
    this.SP.SendMessage(ApiChannel, JSON.stringify(ask), 1);
  }
  public abstract Accept(r:SendData):Promise<void>;
}