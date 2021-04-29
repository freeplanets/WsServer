import Settlement from '../class/Settlememt';
import { Msg, AskTable, ErrCode } from '../class/if';
import DataBaseIF from '../class/DataBaseIF';
import { Connection } from 'mariadb';

class Settle extends Settlement {
  async Update(ask:AskTable,db:DataBaseIF<Connection>):Promise<Msg>{
    const msg:Msg = { ErrNo: ErrCode.PASS };
    return msg;
  }
}