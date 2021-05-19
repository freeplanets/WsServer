import WebSocket from 'ws';

export const enum ErrCode {
  PASS = 0,
  LESS_MIN_HAND = 1,
  OVER_MAX_HAND = 2,
  OVER_SINGLE_NUM = 3,
  OVER_UNION_NUM = 4,
  NUM_STOPED = 5,
  NO_CREDIT = 6,
  NO_LOGIN = 7,
  DELETE_TERM_ERR = 8,
  NOT_DEFINED_ERR = 9,
  MISS_PARAMETER = 10,
  NOT_ENOUGH_NUM = 11,
  GET_CONNECTION_ERR = 12,
  DB_QUERY_ERROR = 13,
  TRY_CATCH_ERROR = 14,
  NO_DATA_FOUND = 15,
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
  Code: string;
  AskType: number; // 0 市價, 1 限價
  BuyType: number; // 0 買(多)單, 1 賣(空)單
  Qty: number;
  Price?: number; // 建倉價格
  Amount: number; // USDT金額
  Fee?: number; // 手續費
  AskFee: number; // 手續費率
  AskPrice: number; // 下單價格
  LeverCredit?: number; // 下單時暫扣的信用額度
  ExtCredit?: number; // 下單後變動的信用額度,只能增加
  Lever?:number;
  LongT?:number;
  ShortT?:number;
  ProcStatus: number;  // 0 等待處理, 1 處理中, 2 成交, 3 取消
  CreateTime: number; // 建單時間
  DealTime?: number; // 成交時間
  ModifyTime?: number; // 修改時間
  SetID?: number; // 平倉對象ID
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
  send(message:string, opt: WebSocket|number):void; // ws:WebSocket | UserID
}
