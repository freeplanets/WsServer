
import { DynamoDB, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
// import { DynamoDB } from 'dynamoose/dist/aws/sdk';
import dotenv from 'dotenv';
// import { ClientConfiguration } from 'aws-sdk/clients/acm';
import * as Dynamoose from 'dynamoose';
// import { AnyDocument } from 'dynamoose/dist/Document';
import { ModelType, SortOrder } from 'dynamoose/dist/General';
import { Condition } from 'dynamoose/dist/Condition';
import { PriceTick } from '../interface/if';
import { Item } from "dynamoose/dist/Item";
// const cd:Condition
dotenv.config();

// export interface MarketTick extends AnyDocument {
export class MarketTick extends Item {
	currencyPair?: string;
	lastPrice?: string;
	exchange?: string;
	lastVol?: string;
	ticktime?: number;
	lastTradeId?: number;
	// originalData?: object;
}

interface lastID {
	lastTradeId: number;
}
interface ItemLastID {
	[key:string]: lastID;
}
export default class MarketTickDB {
	private table:ModelType<MarketTick>;
	private Item:ItemLastID = {};
	private noDataMark = 0;
	private noDataAlert = false;
	private noDataSec = 60000;	// miniSec
	constructor() {
		/*
		const options:DynamoDB.ClientConfiguration = {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			region: process.env.AWS_REGION
		}
		*/
		const options:DynamoDBClientConfig = {
			credentials: {
				accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,	
			},
			region: process.env.AWS_REGION,
			// endpoint: 'http://localhost:8000',
			// endpoint: 'http://localhost:4569',
		}
		console.log("KEYCHECK:", JSON.stringify(options));
		const ddb:DynamoDB = new Dynamoose.aws.ddb.DynamoDB(options);
		Dynamoose.aws.ddb.set(ddb);
		this.table = Dynamoose.model('uccpay-dev-MarketTick', this.Schema);
		// this.table = Dynamoose.model('uccpay-local-MarketTick', this.Schema);
	}
	get NoData() {
		return this.noDataAlert;
	}
	getData(currencyPair:string,ts:number=0){
		return new Promise<PriceTick[]>((resolve, reject)=>{
			//const cond = this.getCondition(currencyPair, ts);
			// console.log('Condition:', JSON.stringify(cond));
			if(!this.Item[currencyPair]){
				this.Item[currencyPair] = { lastTradeId: 0 };
			}
			this.table.query('currencyPair').eq(currencyPair).where('ticktime').gt(ts).where('lastTradeId').gt(this.Item[currencyPair].lastTradeId).sort(SortOrder.ascending).exec().then(res=>{
				let pt:PriceTick[] = [];
				if (Array.isArray(res) && res.count > 0) {
					// const timechk:number[]=[];
					// console.log('get MarketTick:', currencyPair, res, res.count);
					pt = res.map(itm=>{
						// console.log('TickData:', itm.lastTradeId, '>', itm);
						if(itm.lastTradeId) {
							if(itm.lastTradeId > this.Item[currencyPair].lastTradeId) this.Item[currencyPair].lastTradeId = itm.lastTradeId;
						}
						const tmp:PriceTick = {
							code: itm.currencyPair,
							lastPrice: itm.lastPrice ? parseFloat(itm.lastPrice) : 0,
							lastVol: itm.lastVol ? parseFloat(itm.lastVol) : 0,
							ticktime: itm.ticktime ? itm.ticktime : 0,
						}
						// timechk.push(tmp.ticktime);
						// console.log('tick:', tmp);
						return tmp;
					})
					console.log(new Date().toLocaleTimeString(), ts, res.count);
					this.noDataAlert = false;
					this.noDataMark = 0;
					resolve(pt);
				} else {
					if(!this.noDataMark) {
						this.noDataMark = new Date().getTime();
					} else {
						const sec = new Date().getTime();
						if ((sec - this.noDataMark) > this.noDataSec) this.noDataAlert = true;
					}
					resolve(pt);
				}
			}).catch(err => {
				console.log('MarketTickDB getData error', currencyPair, ts, err);
				reject(err);
			})
		});
	}
	private getCondition(currencyPair:string,ticktime:number=0):Condition {
		if(!ticktime) ticktime = new Date().getTime();
		return new Dynamoose.Condition('currencyPair').eq(currencyPair).and().where('ticktime').gt(ticktime);
		// return new Dynamoose.Condition().where('currencyPair').eq(currencyPair).and().where('ticktime').gt(ticktime);
	}
	get Schema() {
		return new Dynamoose.Schema({
			currencyPair: { type: String, hashKey: true },
			ticktime: {	type: Number,	rangeKey: true },
			lastPrice: { type: String },
			lastVol: { type: String },
			exchange: { type: String },
			lastTradeId: { type: Number },
			// originalData: { type: Object },
		});
	}
}