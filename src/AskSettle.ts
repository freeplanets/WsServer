import DB from './db';
import { TMsg, AskTable } from "./if";

async function TestQuery():Promise<void> {
  const db:DB = new DB();
  const sql="select * from AskTable";
  const msg:TMsg<AskTable> = await db.Query(sql);
  console.log(msg);
}