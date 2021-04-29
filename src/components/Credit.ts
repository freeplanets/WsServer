import { Connection } from "mariadb";
import { DbAns } from "../class/if";

export default class Credit {
    constructor(){}
    async ModifyCredit(UserID: number, AgentId: string, money: number, conn: Connection) {
        let  balance: number = await this.getUserCredit(UserID, conn);
        balance = balance + money;
        if (balance < 0) {
            console.log("ModifyCredit chk balanace:", balance, "Money:", money);
            return false;
        }
        const idenkey = `${new Date().getTime()}ts${UserID}`;
        const sql = `insert into UserCredit(uid,AgentID,idenkey,DepWD,Balance) values(?,?,?,?,?,?)`;
        const param = [UserID, AgentId, idenkey, money, balance];
        const dbans: DbAns = await conn.query(sql, param);
        console.log("ModifyCredit:", sql, dbans);
        if (dbans.affectedRows > 0) {
        // return true;
            const bans =  await this.ModifyUserCredit(UserID, balance, conn);
            if (bans) {
                return { balance, orderId: dbans.insertId};
            }
        }
        return false;
    }
    async ModifyUserCredit(UserID: number, balance: number, conn: Connection) {
        const sql = `update Member set Balance=${balance} where id=${UserID}`;
        const ans: DbAns = await conn.query(sql);
        if (ans.affectedRows > 0) { return true; }
        return false;
    }
    async getUserCredit(UserID: number, conn: Connection) {
        return new Promise<number>(async (resolve, reject) => {
            const sql = `select sum(DepWD) balance from UserCredit where uid=?`;
            conn.query(sql, [UserID]).then((res) => {
                let balance: number = 0;
                if (res[0]) {
                    balance = balance + res[0].balance;
                }
                resolve(balance);
            }).catch((err) => {
                console.log("getUserCredit error", err);
                reject(err);
            });
        });
    }

}
