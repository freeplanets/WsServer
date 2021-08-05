import { Msg, AskTable } from '../interface/if';
import DataBaseIF from '../interface/DataBaseIF';
import {Connection} from 'mariadb';

export default abstract class Settlement {
  abstract Update(ask:AskTable, db:DataBaseIF<Connection>):Promise<Msg>;
}