import { Sender } from "./sender.js";
/**
 * DevP2P/RLPx protocol sender
 * @emits message
 * @emits status
 * @memberof module:net/protocol
 */
export class RlpxSender extends Sender {
    /**
     * Creates a new DevP2P/Rlpx protocol sender
     * @param rlpxProtocol protocol object from @ethereumjs/devp2p
     */
    constructor(rlpxProtocol) {
        super();
        this.sender = rlpxProtocol;
        this.sender.events.on('status', (status) => {
            this.status = status;
        });
        this.sender.events.on('message', (code, payload) => {
            this.emit('message', { code, payload });
        });
    }
    /**
     * Send a status to peer
     * @param status
     */
    sendStatus(status) {
        try {
            this.sender.sendStatus(status);
        }
        catch (err) {
            this.emit('error', err);
        }
    }
    /**
     * Send a message to peer
     * @param code message code
     * @param data message payload
     */
    sendMessage(code, data) {
        try {
            //@ts-expect-error "type number is not assignable to type never"
            this.sender.sendMessage(code, data);
        }
        catch (err) {
            this.emit('error', err);
        }
    }
}
//# sourceMappingURL=rlpxsender.js.map