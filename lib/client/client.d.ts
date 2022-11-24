import { Connection } from "./connection";
type KeepAliveClientOptions = Partial<{
    /**
     * The number of milliseconds to wait before considering the connection closed due to inactivity.
     * This number should match the server's `pingTimeout` option.
     * @default 30000
     * @see maxLatency.
     */
    pingTimeout: number;
    /**
     * This number plus @see pingTimeout is the maximum amount of time that can pass before the connection is considered closed.
     * @default 2000
     */
    maxLatency: number;
    /**
     * Whether or not to reconnect automatically.
     * @default true
     */
    shouldReconnect: boolean;
    /**
     * The number of milliseconds to wait between reconnect attempts.
     * @default 2000
     */
    reconnectInterval: number;
    /**
     * The number of times to attempt to reconnect before giving up and
     * emitting a `reconnectfailed` event.
     * @default Infinity
     */
    maxReconnectAttempts: number;
}>;
export declare class KeepAliveClient extends EventTarget {
    connection: Connection;
    url: string;
    socket: WebSocket;
    pingTimeout: ReturnType<typeof setTimeout>;
    options: KeepAliveClientOptions;
    isReconnecting: boolean;
    constructor(url: string, opts?: KeepAliveClientOptions);
    applyListeners(): void;
    heartbeat(): void;
    reconnect(): Promise<void>;
    command(command: string, payload: any, expiresIn?: number, callback?: Function): Promise<unknown>;
}
export {};
//# sourceMappingURL=client.d.ts.map