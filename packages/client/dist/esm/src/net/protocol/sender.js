import { EthereumJSErrorWithoutCode } from '@ethereumjs/util';
import { EventEmitter } from 'eventemitter3';
/**
 * Base class for transport specific message sender/receiver. Subclasses should
 * emit a message event when the sender receives a new message, and they should
 * emit a status event when the sender receives a handshake status message
 * @emits message
 * @emits status
 * @memberof module:net/protocol
 */
export class Sender extends EventEmitter {
    constructor() {
        super();
        this._status = null;
    }
    get status() {
        return this._status;
    }
    set status(status) {
        this._status = status;
        this.emit('status', status);
    }
    /**
     * Send a status to peer
     * @param status
     */
    sendStatus(_status) {
        throw EthereumJSErrorWithoutCode('Unimplemented');
    }
    /**
     * Send a message to peer
     * @param code message code
     * @param rlpEncodedData rlp encoded message payload
     */
    sendMessage(_code, _rlpEncodedData) {
        throw EthereumJSErrorWithoutCode('Unimplemented');
    }
}
//# sourceMappingURL=sender.js.map