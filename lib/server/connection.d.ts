/// <reference types="node" />
/// <reference types="node" />
import EventEmitter from "node:events";
import { IncomingMessage } from "node:http";
import { WebSocket } from "ws";
import { KeepAliveServerOptions } from ".";
import { Command } from "./command";
import { Latency } from "./latency";
import { Ping } from "./ping";
export declare class Connection extends EventEmitter {
    id: string;
    socket: WebSocket;
    alive: boolean;
    latency: Latency;
    ping: Ping;
    remoteAddress: string;
    options: KeepAliveServerOptions;
    constructor(socket: WebSocket, req: IncomingMessage, options: KeepAliveServerOptions);
    startIntervals(): void;
    stopIntervals(): void;
    applyListeners(): void;
    send(cmd: Command): void;
}
//# sourceMappingURL=connection.d.ts.map