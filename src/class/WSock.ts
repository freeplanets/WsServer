import AWebSocket from "../aclass/AWebSocket";

export default class WSock extends AWebSocket {
	constructor(){
		super();
	}
	onMessage(msg:string) {
		// this.manager.AcceptMessage(msg);
	}

}