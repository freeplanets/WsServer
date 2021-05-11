import AskSettlement from '../class/AskSettlement';
import { SendData, AskTable, Msg, ErrCode } from '../class/if';
import DataBaseIF from '../class/DataBaseIF';
import { Connection } from 'mariadb';
import SettleProc from '../components/SettleProc';

export default class LimitPrice extends AskSettlement {
  constructor(db:DataBaseIF<Connection>, ask:AskTable, SP:SettleProc){
    super(db, ask.Code, ask.AskType, SP);
    this.Add(ask);
  }
  async Accept(r:SendData){
    if(this.Code !== r.symbol) return;
    if(this.inProcess) return;
    let pMark = false;
    this.inProcess = true;
    await Promise.all(
      this.list.map(async (ask:AskTable) => {
        console.log(this.IdentifyCode,ask.id,ask.CreateTime,new Date(ask.CreateTime).getTime(),r.eventTime);
        if (new Date(ask.CreateTime).getTime() < r.eventTime){
          const price = parseFloat(r.currentClose);
          const key = ask.BuyType ?  1 : -1;
          console.log('LimitPrice', ask.AskPrice, price, (price - ask.AskPrice)*key);
          if ((price - ask.AskPrice)*key >= 0) { //58798.64 58470.93
            ask.Price = ask.AskPrice;
            ask.AskPrice = price;
            ask.Qty = parseFloat((ask.Amount / price).toFixed(8));
            ask.DealTime = r.eventTime;
            const msg:Msg = await this.Settle(ask);
            if(msg.ErrNo === ErrCode.PASS) {
              this.removelist.push(ask);
            }
          } else {
            pMark = true;
          }
        }
      })
    )
    if(this.removelist.length > 0) this.RemoveFromList();
    else this.inProcess = false;
    if(pMark) this.inProcess = false;
  }
}