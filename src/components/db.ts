import dotenv from 'dotenv';
import mariadb,{ ConnectionConfig, Connection} from 'mariadb';
import { Msg } from '../interface/if';
import { ErrCode } from '../interface/ENum';
import DatabaseIF from '../interface/DataBaseIF';

dotenv.config();

export default class db implements DatabaseIF<Connection> {
  private config: ConnectionConfig = {
    host: process.env.MDHOST,
    user: process.env.MDUSER,
    password: process.env.MDPASSWORD,
    database: process.env.MDDATABASE,
    port: process.env.MDPORT ? parseInt(process.env.MDPORT, 10) : 3306,
    // timezone: "Asia/Taipei",
    charset: "UTF8"  
  }
  public conn:Connection | undefined;
  constructor(){}
  public async createConnection():Promise<Connection|undefined>{
    let conn: Connection | undefined;
    try {
      conn = await mariadb.createConnection(this.config);
      this.conn = conn;
    } catch ( err ) {
      console.log('Create Connection error:', err);
    }
    return conn;
  }
  async begintrans():Promise<Msg> {
    const msg:Msg = { ErrNo: ErrCode.PASS };
    if(!this.conn) {
      msg.ErrNo = ErrCode.GET_CONNECTION_ERR;
      return msg;
    }
    await this.conn.beginTransaction();
    return msg;
  }
  async rollback():Promise<Msg> {
    const msg:Msg = { ErrNo: ErrCode.PASS };
    if(!this.conn) {
      msg.ErrNo = ErrCode.GET_CONNECTION_ERR;
      return msg;
    }
    await this.conn.rollback();
    return msg;
  }
  async commit():Promise<Msg> {
    const msg:Msg = { ErrNo: ErrCode.PASS };
    if(!this.conn) {
      msg.ErrNo = ErrCode.GET_CONNECTION_ERR;
      return msg;
    }
    await this.conn.commit();
    return msg;
  }  
  async query(sql:string):Promise<Msg>{
    const msg:Msg = { ErrNo: ErrCode.PASS }
    const conn = await this.createConnection();
    if(conn) {
      return new Promise((resolve,reject)=>{
        conn.query(sql).then((res)=>{
          msg.data = res;
          resolve(msg);
        }).catch((err)=>{
          console.log('Query Error', sql, err);
          msg.ErrNo = ErrCode.DB_QUERY_ERROR;
          msg.ErrCon = 'DB query error';
          resolve(msg);
        })
      })
    }
    msg.ErrNo = ErrCode.GET_CONNECTION_ERR;
    msg.ErrCon = 'Get connectioin error';
    return msg;
  }
}
