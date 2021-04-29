import ASetSql from "./ASetSql";
import { KeyVal, TableData} from "../class/if";
import UpdateSqlString from "./UpdateSqlString";
export default class RemoveSqlString extends ASetSql<TableData> {
  private static uss: UpdateSqlString = new UpdateSqlString();
  public getSql(t: TableData): string {
    const kv: KeyVal = {key: "isCanceled", value: 1};
    t.fields?.push(kv);
    return RemoveSqlString.uss.getSql(t);
  }
}
