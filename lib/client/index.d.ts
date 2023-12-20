declare class IdManager {
    ids: Array<true | false>;
    index: number;
    maxIndex: number;
    constructor(maxIndex?: number);
    release(id: number): void;
    reserve(): number;
}

declare class QueueItem {
    value: any;
    expireTime: number;
    constructor(value: any, expiresIn: number);
    get expiresIn(): number;
    get isExpired(): boolean;
}
declare class Queue {
    items: any[];
    add(item: any, expiresIn: number): void;
    get isEmpty(): boolean;
    pop(): QueueItem | null;
}

type Command = {
    id?: number;
    command: string;
    payload?: any;
};
type LatencyPayload = {
    /** Round trip time in milliseconds. */
    latency: number;
};
declare interface Connection extends EventTarget {
    addEventListener(type: "message", listener: (ev: CustomEvent) => any, options?: boolean | AddEventListenerOptions): void;
    /** Emits when a connection is made. */
    addEventListener(type: "connection", listener: () => any, options?: boolean | AddEventListenerOptions): void;
    /** Emits when a connection is made. */
    addEventListener(type: "connected", listener: () => any, options?: boolean | AddEventListenerOptions): void;
    /** Emits when a connection is made. */
    addEventListener(type: "connect", listener: () => any, options?: boolean | AddEventListenerOptions): void;
    /** Emits when a connection is closed. */
    addEventListener(type: "close", listener: () => any, options?: boolean | AddEventListenerOptions): void;
    /** Emits when a connection is closed. */
    addEventListener(type: "closed", listener: () => any, options?: boolean | AddEventListenerOptions): void;
    /** Emits when a connection is closed. */
    addEventListener(type: "disconnect", listener: () => any, options?: boolean | AddEventListenerOptions): void;
    /** Emits when a connection is closed. */
    addEventListener(type: "disconnected", listener: () => any, options?: boolean | AddEventListenerOptions): void;
    /** Emits when a reconnect event is successful. */
    addEventListener(type: "reconnect", listener: () => any, options?: boolean | AddEventListenerOptions): void;
    /** Emits when a reconnect fails after @see KeepAliveClientOptions.maxReconnectAttempts attempts. */
    addEventListener(type: "reconnectfailed", listener: () => any, options?: boolean | AddEventListenerOptions): void;
    /** Emits when a ping message is received from @see KeepAliveServer from `@prsm/keepalive-ws/server`. */
    addEventListener(type: "ping", listener: (ev: CustomEventInit<{}>) => any, options?: boolean | AddEventListenerOptions): void;
    /** Emits when a latency event is received from @see KeepAliveServer from `@prsm/keepalive-ws/server`. */
    addEventListener(type: "latency", listener: (ev: CustomEventInit<LatencyPayload>) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: (ev: CustomEvent) => any, options?: boolean | AddEventListenerOptions): void;
}
declare class Connection extends EventTarget {
    socket: WebSocket;
    ids: IdManager;
    queue: Queue;
    callbacks: {
        [id: number]: (error: Error | null, result?: any) => void;
    };
    constructor(socket: WebSocket);
    /**
     * Adds an event listener to the target.
     * @param event The name of the event to listen for.
     * @param listener The function to call when the event is fired.
     * @param options An options object that specifies characteristics about the event listener.
     */
    on(event: string, listener: (ev: CustomEvent) => any, options?: boolean | AddEventListenerOptions): void;
    /**
     * Removes the event listener previously registered with addEventListener.
     * @param event A string that specifies the name of the event for which to remove an event listener.
     * @param listener The event listener to be removed.
     * @param options An options object that specifies characteristics about the event listener.
     */
    off(event: string, listener: (ev: CustomEvent) => any, options?: boolean | AddEventListenerOptions): void;
    sendToken(cmd: Command, expiresIn: number): void;
    applyListeners(reconnection?: boolean): void;
    command(command: string, payload: any, expiresIn?: number, callback?: Function | null): Promise<unknown>;
    createTimeoutPromise(id: number, expiresIn: number): Promise<unknown>;
    createResponsePromise(id: number): Promise<unknown>;
}

type KeepAliveClientOptions = Partial<{
    /**
     * The number of milliseconds to wait before considering the connection closed due to inactivity.
     * When this happens, the connection will be closed and a reconnect will be attempted if @see KeepAliveClientOptions.shouldReconnect is true.
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
declare class KeepAliveClient extends EventTarget {
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
    command(command: string, payload?: any, expiresIn?: number, callback?: Function): Promise<unknown>;
}

export { Connection, KeepAliveClient };
