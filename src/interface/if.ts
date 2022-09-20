import WebSocket from 'ws';
import { FuncKey, ErrCode } from './ENum';
export interface AnyMsg {
  [key:string]:any;
}
export interface WsMsg extends AnyMsg {
  Func?: FuncKey;
  data?: any;
  Asks?: AskTable | AskTable[];
  Ask?: AskTable;
  Balance?: number;
  LedgerTotal?: any;
  Message?: string;
  ChannelName?: string;
  UserID?: number;
  SendTo?: number | number[];
}
export interface DbAns  {
  affectedRows: number;
  insertId: number;
  warningStatus: number;
  [key: string]: number;
}
export interface SendData {
  eventTime: number;
  symbol: string;
  currentClose: string;
  closeQuantity: string;
  open?:string;
  priceChangePercent?:string;
}
export interface ReceivedData {
  eventType: string;
  eventTime: number;
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAveragePrice: string;
  previousClose: string;
  currentClose: string;
  closeQuantity: string;
  bestBid: string;
  bestBidQuantity: string;
  bestAskPrice: string;
  bestAskQuantity: string;
  open: string;
  high: string;
  low: string;
  baseAssetVolume: string;
  quoteAssetVolume: string;
  openTime: number;
  closeTime: number;
  firstTradeId: number;
  lastTradeId: number;
  trades: number;  
}
export interface AskTable {
  id: number;
  UserID: number;
  UpId: number;
  ItemID: number;
  ItemType: number; // 1買多商品, 2買空商品
  Code: string;
  AskType: number; // 0 市價, 1 限價
  BuyType: number; // 0 買單, 1 賣單
  Qty: number;
  Price: number; // 建倉價格
  Amount: number; // USDT金額
  Fee: number; // 手續費
  AskFee: number; // 手續費率
  AskPrice: number; // 下單價格
  LeverCredit: number; // 下單時暫扣的信用額度
  ExtCredit: number; // 下單後變動的信用額度,只能增加
  Lever:number;
  GainPrice:number;
  LosePrice:number;
  StopGain:number;     // 獲利平倉比
  StopLose:number;     // 損失平倉保証金比
  ProcStatus: number;  // 0 等待處理, 1 處理中, 2 成交, 3 取消
  CreateTime: number; // 建單時間
  DealTime?: number; // 成交時間
  ModifyTime?: number; // 修改時間
  SetID: number; // 平倉對象ID -> System下單
  USetID: number;  // 平倉對象ID -> User下單
  isUserSettle: number; // 會員平倉
  ChoicePrice?: number; // 有利價
}
export interface DealTable {
  id: number;
  UserID: number;
  ItemID: number;
  Code: string;
  Type: number;
  BuyType: number;
  Amount?: number; // USDT金額
  OpenPrice?: number; // 建倉價格
  OpenFee?: number;
  ClosePrice?: number; // 平倉價格
  CloseFee?: number;
  CloseType?: number; // 平倉種類 0 市價, 1限價

  OpenCredit?: number; // 開倉信用額度
  CloseCredit?: number; // 平倉信用額度
  ProcessStatus?: number;  // 0 等待處理 1 處理中
  CreateTime?: number; // 建單時間
  OpenTime?: number; // 新倉時間
  CreateCloseTime?: number; // 平倉建單時間
  CloseTime?: number; // 平倉時間
}
export interface Msg {
  ErrNo: ErrCode;
  ErrCon?: string;
  [key: string]: any
}
export interface TMsg<T> extends Msg {
  data?: T[];
}
// key = Code + BuyType
export interface ObjectIdentify {
  [key:string]:boolean;
}
export interface KeyVal {
  [key:string]:any;
}
export interface TableData {
  TableName: string;
  keys?: string[];
  fields?: KeyVal[];
}
export interface ChannelT {
  readonly Name:string;
  register(ws:WebSocket,UserID?:number):void;
  send(message:string, opt?: WebSocket|number):boolean; // ws:WebSocket | UserID
  remove(ws:WebSocket):void;
}

export interface PriceTick {
  code?:string;
	lastPrice: number;
	lastVol: number;
	ticktime: number;
}

export interface ItemInfo {
  Code: string;
}