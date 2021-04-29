import { Msg, KeyVal } from './if';
// C connection,P Object of params
export default interface DatabaseIF<C> {
  conn:C|undefined;
  createConnection():Promise<C|undefined>;
  begintrans():Promise<Msg>;
  rollback():Promise<Msg>;
  commit():Promise<Msg>;
  query(sql:string,param?:KeyVal):Promise<Msg>;
}