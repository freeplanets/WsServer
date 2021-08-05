import DB from './components/db';
import { TMsg, AskTable } from "./interface/if";

async function TestQuery():Promise<void> {
  const db:DB = new DB();
  const sql="select * from AskTable";
  const msg:TMsg<AskTable> = await db.query(sql);
  console.log(msg);
}