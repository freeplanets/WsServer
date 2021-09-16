import { AnyMsg } from '../interface/if';
export function JsonParse<T extends AnyMsg>(str:string):T {
	let msg:T;
	try {
		msg = JSON.parse(str);
		return msg;
	} catch( err ) {
		console.log('SettleProc JSON parse error:', str, ', Error:', err);
		msg = err as T;
		return msg;
	}
}