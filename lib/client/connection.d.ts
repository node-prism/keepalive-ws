import { IdManager } from "./ids";
import { Queue } from "./queue";
type Command = {
    id?: number;
    command: string;
    payload?: any;
};
export declare interface Connection extends EventTarget {
    addEventListener(type: "message", listener: (ev: CustomEvent) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: "connection", listener: () => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: "close", listener: () => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: "ping", listener: () => any, options?: boolean | AddEventListenerOptions): void;
    /** Emits when a reconnect event is successful. */
    addEventListener(type: "reconnect", listener: () => any, options?: boolean | AddEventListenerOptions): void;
    /** Emits when a reconnect fails after @see KeepAliveClientOptions.maxReconnectAttempts attempts. */
    addEventListener(type: "reconnectfailed", listener: () => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: (ev: CustomEvent) => any, options?: boolean | AddEventListenerOptions): void;
}
export declare class Connection extends EventTarget {
    socket: WebSocket;
    ids: IdManager;
    queue: Queue;
    callbacks: {
        [id: number]: (error: Error | null, result?: any) => void;
    };
    constructor(socket: WebSocket);
    sendToken(cmd: Command, expiresIn: number): void;
    applyListeners(reconnection?: boolean): void;
    command(command: string, payload: any, expiresIn?: number, callback?: Function | null): Promise<unknown>;
    createTimeoutPromise(id: number, expiresIn: number): Promise<unknown>;
    createResponsePromise(id: number): Promise<unknown>;
}
export {};
//# sourceMappingURL=connection.d.ts.map