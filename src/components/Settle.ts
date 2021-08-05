import Settlement from '../aclass/Settlememt';
import { Msg, AskTable } from '../interface/if';
import { ErrCode } from '../interface/ENum';
import DataBaseIF from '../interface/DataBaseIF';
import { Connection } from 'mariadb';

class Settle extends Settlement {
  async Update(ask:AskTable,db:DataBaseIF<Connection>):Promise<Msg>{
    const msg:Msg = { ErrNo: ErrCode.PASS };
    return msg;
  }
}