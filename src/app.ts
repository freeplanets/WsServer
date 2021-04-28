import DB from './db';
import { TMsg, AskTable } from "./if";
import AskSettlement from './AskSettlement';
import Matt from './mqtt';
import CurPrice from './CurPrice';
import LimitPrice from './LimitPrice';

const matt=new Matt()

async function TestQuery():Promise<void> {
  const db:DB = new DB();
  const clts:AskSettlement[]=[];
  const sql="select * from AskTable";
  const msg:TMsg<AskTable> = await db.Query(sql);
  //console.log(msg);
  if(msg.data){
    msg.data.forEach((ask:AskTable)=>{
      console.log('static check:',AskSettlement.Identify);
      const idenKey = `${ask.Code}${ask.AskType}`;
      console.log('idenKey:',idenKey);
      if (!AskSettlement.Identify[idenKey]){
        if(ask.AskType === 0){
          clts.push(new CurPrice(ask));
        } else {
          clts.push(new LimitPrice(ask));
        }
      } else {
        clts.forEach((clt:AskSettlement)=>{
          clt.Add(ask);
        })
      }
    })
  }
  matt.Clients = clts;
}

TestQuery();
