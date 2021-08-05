import ASetSql from "./ASetSql";
import { KeyVal, TableData} from "../interface/if";
export default class AddSqlString extends ASetSql<TableData> {
  public getSql(t: TableData): string {
    const fields: string[] = [];
    const values: string[] = [];
    if (t.fields) {
      t.fields.map((itm: KeyVal) => {
        fields.push(itm.key);
        values.push(typeof(itm.value) === "string" ? `'${itm.value}'` : `${itm.value}`);
      });
    }
    return `Insert into ${t.TableName}(${fields.join(",")}) values(${values.join(",")})`;
  }
}
