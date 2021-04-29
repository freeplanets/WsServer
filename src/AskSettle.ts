import DB from './components/db';
import { TMsg, AskTable } from "./class/if";

async function TestQuery():Promise<void> {
  const db:DB = new DB();
  const sql="select * from AskTable";
  const msg:TMsg<AskTable> = await db.Query(sql);
  console.log(msg);
}