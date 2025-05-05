import { ETH as Devp2pETH, RLPx as Devp2pRLPx, SNAP as Devp2pSNAP } from '@ethereumjs/devp2p';
import { randomBytes, unprefixedHexToBytes } from '@ethereumjs/util';
import { Event } from "../../types.js";
import { RlpxSender } from "../protocol/index.js";
import { Peer } from "./peer.js";
const devp2pCapabilities = {
    snap1: Devp2pSNAP.snap,
    eth66: Devp2pETH.eth66,
    eth67: Devp2pETH.eth67,
    eth68: Devp2pETH.eth68,
};
/**
 * Devp2p/RLPx peer
 * @memberof module:net/peer
 * @example
 * ```ts
 * import { RlpxPeer } from './src/net/peer'
 * import { Chain } from './src/blockchain'
 * import { EthProtocol } from './src/net/protocol'
 *
 * const chain = await Chain.create()
 * const protocols = [ new EthProtocol({ chain })]
 * const id = '70180a7fcca96aa013a3609fe7c23cc5c349ba82652c077be6f05b8419040560a622a4fc197a450e5e2f5f28fe6227637ccdbb3f9ba19220d1fb607505ffb455'
 * const host = '192.0.2.1'
 * const port = 12345
 *
 * new RlpxPeer({ id, host, port, protocols })
 *   .on('error', (err) => console.log('Error:', err))
 *   .on('connected', () => console.log('Connected'))
 *   .on('disconnected', (reason) => console.log('Disconnected:', reason))
 *   .connect()
 * ```
 */
export class RlpxPeer extends Peer {
    /**
     * Create new devp2p/rlpx peer
     */
    constructor(options) {
        const address = `${options.host}:${options.port}`;
        super({
            ...options,
            transport: 'rlpx',
            address,
        });
        this.host = options.host;
        this.port = options.port;
        this.rlpx = null;
        this.rlpxPeer = null;
        this.connected = false;
    }
    /**
     * Return devp2p/rlpx capabilities for the specified protocols
     * @param protocols protocol instances
     */
    static capabilities(protocols) {
        const capabilities = [];
        for (const protocol of protocols) {
            const { name, versions } = protocol;
            const keys = versions.map((v) => name + String(v));
            for (const key of keys) {
                const capability = devp2pCapabilities[key];
                if (capability !== undefined) {
                    capabilities.push(capability);
                }
            }
        }
        return capabilities;
    }
    /**
     * Initiate peer connection
     */
    async connect() {
        if (this.connected) {
            return;
        }
        const key = randomBytes(32);
        await Promise.all(this.protocols.map((p) => p.open()));
        this.rlpx = new Devp2pRLPx(key, {
            capabilities: RlpxPeer.capabilities(this.protocols),
            common: this.config.chainCommon,
        });
        await this.rlpx.connect({
            id: unprefixedHexToBytes(this.id),
            address: this.host,
            tcpPort: this.port,
        });
        const peerErrorHandler = (_, error) => {
            this.config.events.emit(Event.PEER_ERROR, error, this);
        };
        const peerErrorHandlerBound = peerErrorHandler.bind(this);
        const peerAddedHandler = async (rlpxPeer) => {
            try {
                await this.bindProtocols(rlpxPeer);
                this.config.events.emit(Event.PEER_CONNECTED, this);
            }
            catch (error) {
                this.config.events.emit(Event.PEER_ERROR, error, this);
            }
        };
        const peerRemovedHandler = (rlpxPeer) => {
            if (rlpxPeer !== this.rlpxPeer) {
                return;
            }
            this.rlpxPeer = null;
            this.connected = false;
            this.config.events.emit(Event.PEER_DISCONNECTED, this);
            this.rlpx?.events.removeListener('peer:error', peerErrorHandlerBound);
        };
        this.rlpx.events.on('peer:error', peerErrorHandlerBound);
        this.rlpx.events.once('peer:added', peerAddedHandler.bind(this));
        this.rlpx.events.once('peer:removed', peerRemovedHandler.bind(this));
    }
    /**
     * Accept new peer connection from an rlpx server
     */
    async accept(rlpxPeer, server) {
        if (this.connected) {
            return;
        }
        await this.bindProtocols(rlpxPeer);
        this.server = server;
    }
    /**
     * Adds protocols to this peer given an rlpx native peer instance.
     * @param rlpxPeer rlpx native peer
     */
    async bindProtocols(rlpxPeer) {
        this.rlpxPeer = rlpxPeer;
        await Promise.all(rlpxPeer.getProtocols().map((rlpxProtocol) => {
            const name = rlpxProtocol.constructor.name.toLowerCase();
            const protocol = this.protocols.find((p) => p.name === name);
            // Since snap is running atop/besides eth, it doesn't need a separate sender
            // handshake, and can just use the eth handshake
            if (protocol && name !== 'snap') {
                const sender = new RlpxSender(rlpxProtocol);
                return this.addProtocol(sender, protocol).then(() => {
                    if (name === 'eth') {
                        const snapRlpxProtocol = rlpxPeer
                            .getProtocols()
                            .filter((p) => p.constructor.name.toLowerCase() === 'snap')[0];
                        const snapProtocol = snapRlpxProtocol !== undefined
                            ? this.protocols.find((p) => p.name === snapRlpxProtocol?.constructor.name.toLowerCase())
                            : undefined;
                        if (snapProtocol !== undefined) {
                            const snapSender = new RlpxSender(snapRlpxProtocol);
                            return this.addProtocol(snapSender, snapProtocol);
                        }
                    }
                });
            }
        }));
        this.connected = true;
    }
}
//# sourceMappingURL=rlpxpeer.js.map