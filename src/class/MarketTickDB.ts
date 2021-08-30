
import { DynamoDB } from 'aws-sdk';
import dotenv from 'dotenv';
// import { ClientConfiguration } from 'aws-sdk/clients/acm';
import * as Dynamoose from 'dynamoose';
import { AnyDocument } from 'dynamoose/dist/Document';
import { ModelType, SortOrder } from 'dynamoose/dist/General';
import { Condition } from 'dynamoose/dist/Condition';
import { PriceTick } from '../interface/if';
// const cd:Condition

dotenv.config();

export interface MarketTick extends AnyDocument {
	currencyPair?: string;
	lastPrice?: string;
	exchange?: string;
	lastVol?: string;
	ticktime?: number;
}

export default class MarketTickDB {
	private table:ModelType<MarketTick>;
	constructor() {
		const options:DynamoDB.ClientConfiguration = {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			region: process.env.AWS_REGION
		}
		const ddb:DynamoDB = new Dynamoose.aws.sdk.DynamoDB(options);
		Dynamoose.aws.ddb.set(ddb);
		this.table = Dynamoose.model('uccpay-dev-MarketTick', this.Schema);
	}
	getData(currencyPair:string,ts:number=0){
		return new Promise<PriceTick[]>((resolve, reject)=>{
			//const cond = this.getCondition(currencyPair, ts);
			// console.log('Condition:', JSON.stringify(cond));

			this.table.query('currencyPair').eq(currencyPair).where('ticktime').gt(ts).sort(SortOrder.ascending).exec().then(res=>{
				let pt:PriceTick[] = [];
				if (Array.isArray(res)) {
					// const timechk:number[]=[];
					pt = res.map(itm=>{
						const tmp:PriceTick = {
							code: itm.currencyPair,
							lastPrice: itm.lastPrice ? parseFloat(itm.lastPrice) : 0,
							lastVol: itm.lastVol ? parseFloat(itm.lastVol) : 0,
							ticktime: itm.ticktime ? itm.ticktime : 0,
						}
						// timechk.push(tmp.ticktime);
						return tmp;
					})
					// console.log(new Date().toLocaleTimeString(), ts, res.count, JSON.stringify(timechk));
					resolve(pt);
				} else {
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
			exchange: { type: String }
		});
	}
}