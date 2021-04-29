import ADBA from "./ADBA";
import AddSqlString from "./AddSqlString";
import ASetSql from "./ASetSql";
import { TableData } from "../class/if";
import RemoveSqlString from "./RemoveSqlString";
import UpdateSqlString from "./UpdateSqlString";

export default class DatabaseAdmin extends ADBA<TableData> {
  public add(t: TableData) {
    const sql = this.getSql(t, new AddSqlString());
    console.log(sql);
  }
  public update(t: TableData) {
    const sql = this.getSql(t, new UpdateSqlString());
    console.log(sql);
  }
  public remove(t: TableData) {
    const sql = this.getSql(t, new RemoveSqlString());
    console.log(sql);
  }
  public getSql(t: TableData, cls: ASetSql<TableData>): string {
    return cls.getSql(t);
  }
}
/*
const dta: ITableData = {
  TableName: "mytable",
  keys: ["id"],
  fields: [
    {key: "id", value: 2},
    // {key:'field1',value:1},
    // {key:'field2',value:'test'}
  ]
};
const dba = new DatabaseAdmin();
dba.remove(dta);
*/
