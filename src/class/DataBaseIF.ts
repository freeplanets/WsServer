import {Msg} from './if';
// C connection,P Object of params
export default interface DatabaseIF<C,P> {
  conn:C;
  getConnection():Promise<C|undefined>;
  BeginTrans():Promise<Msg>;
  RollBack():Promise<Msg>;
  Commit():Promise<Msg>;
  Query(sql:string,param?:P):Promise<Msg>;
}