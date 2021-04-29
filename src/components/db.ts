import dotenv from 'dotenv';
import mariadb,{ ConnectionConfig, Connection} from 'mariadb';
import { ErrCode, Msg } from '../class/if';

dotenv.config();

export default class db {
  private config: ConnectionConfig = {
    host: process.env.MDHOST,
    user: process.env.MDUSER,
    password: process.env.MDPASSWORD,
    database: process.env.MDDATABASE,
    port: process.env.MDPORT ? parseInt(process.env.MDPORT, 10) : 3306,
    timezone: "Asia/Taipei",
    charset: "UTF8"  
  }
  private conn:Connection | undefined;
  constructor(){}
  private async createConnection():Promise<Connection|undefined>{
    if(!this.conn){
      try {
        this.conn = await mariadb.createConnection(this.config);
        return this.conn;
      } catch ( err ) {
        console.log('Create Connection error:', err);
        return;
      }
    }
    return this.conn;
  }
  async BeginTrans():Promise<Msg> {
    const msg:Msg = { ErrNo: ErrCode.GET_CONNECTION_ERR };
    if(!this.conn) this.conn = await this.createConnection();
    if(!this.conn) {
      return msg;
    }
    msg.ErrNo = ErrCode.PASS;
    return msg;
  }
  async Query(sql:string):Promise<Msg>{
    const msg:Msg = { ErrNo: ErrCode.PASS }
    const conn = await this.createConnection();
    if(conn) {
      return new Promise((resolve,rejects)=>{
        conn.query(sql).then((res)=>{
          msg.data = res;
          resolve(msg);
        }).catch((err)=>{
          console.log('Query Error', sql, err);
          msg.ErrNo = ErrCode.DB_QUERY_ERROR;
          msg.ErrCon = 'DB query error';
          rejects(msg)
        })
      })
    }
    msg.ErrNo = ErrCode.GET_CONNECTION_ERR;
    msg.ErrCon = 'Get connectioin error';
    return msg;
  }
}
