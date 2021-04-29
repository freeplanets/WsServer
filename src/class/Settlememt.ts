import { Msg, AskTable } from './if';
import DataBaseIF from './DataBaseIF';
import {Connection} from 'mariadb';

export default abstract class Settlement {
  abstract Update(ask:AskTable, db:DataBaseIF<Connection>):Promise<Msg>;
}