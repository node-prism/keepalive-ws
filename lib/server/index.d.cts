import { IncomingMessage } from 'node:http';
import { WebSocket, ServerOptions, WebSocketServer } from 'ws';
import EventEmitter from 'node:events';

interface Command {
    id?: number;
    command: string;
    payload: any;
}

declare class Latency {
    start: number;
    end: number;
    ms: number;
    interval: ReturnType<typeof setTimeout>;
    onRequest(): void;
    onResponse(): void;
}

declare class Ping {
    interval: ReturnType<typeof setTimeout>;
}

declare class Connection extends EventEmitter {
    id: string;
    socket: WebSocket;
    alive: boolean;
    latency: Latency;
    ping: Ping;
    remoteAddress: string;
    connectionOptions: KeepAliveServerOptions;
    constructor(socket: WebSocket, req: IncomingMessage, options: KeepAliveServerOptions);
    startIntervals(): void;
    stopIntervals(): void;
    applyListeners(): void;
    send(cmd: Command): void;
}

declare class WSContext {
    wss: KeepAliveServer;
    connection: Connection;
    payload: any;
    constructor(wss: KeepAliveServer, connection: Connection, payload: any);
}
type SocketMiddleware = (c: WSContext) => Promise<any>;
type KeepAliveServerOptions = ServerOptions & {
    /**
     * The interval at which to send ping messages to the client.
     * @default 30000
     */
    pingInterval?: number;
    /**
     * The interval at which to send both latency requests and updates to the client.
     * @default 5000
     */
    latencyInterval?: number;
};
declare interface KeepAliveServer extends WebSocketServer {
    on(event: "connection", handler: (socket: WebSocket, req: IncomingMessage) => void): this;
    on(event: "connected", handler: () => void): this;
    on(event: "close", handler: () => void): this;
    emit(event: "connection", socket: WebSocket, req: IncomingMessage): boolean;
    emit(event: "connected", connection: Connection): boolean;
    emit(event: "close", connection: Connection): boolean;
    emit(event: "error", connection: Connection): boolean;
    on(event: "error", cb: (this: WebSocketServer, error: Error) => void): this;
    on(event: "headers", cb: (this: WebSocketServer, headers: string[], request: IncomingMessage) => void): this;
    on(event: string | symbol, listener: (this: WebSocketServer, ...args: any[]) => void): this;
    once(event: "connection", cb: (this: WebSocketServer, socket: WebSocket, request: IncomingMessage) => void): this;
    once(event: "error", cb: (this: WebSocketServer, error: Error) => void): this;
    once(event: "headers", cb: (this: WebSocketServer, headers: string[], request: IncomingMessage) => void): this;
    once(event: "close" | "listening", cb: (this: WebSocketServer) => void): this;
    once(event: string | symbol, listener: (this: WebSocketServer, ...args: any[]) => void): this;
    off(event: "connection", cb: (this: WebSocketServer, socket: WebSocket, request: IncomingMessage) => void): this;
    off(event: "error", cb: (this: WebSocketServer, error: Error) => void): this;
    off(event: "headers", cb: (this: WebSocketServer, headers: string[], request: IncomingMessage) => void): this;
    off(event: "close" | "listening", cb: (this: WebSocketServer) => void): this;
    off(event: string | symbol, listener: (this: WebSocketServer, ...args: any[]) => void): this;
    addListener(event: "connection", cb: (client: WebSocket, request: IncomingMessage) => void): this;
    addListener(event: "error", cb: (err: Error) => void): this;
    addListener(event: "headers", cb: (headers: string[], request: IncomingMessage) => void): this;
    addListener(event: "close" | "listening", cb: () => void): this;
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(event: "connection", cb: (client: WebSocket) => void): this;
    removeListener(event: "error", cb: (err: Error) => void): this;
    removeListener(event: "headers", cb: (headers: string[], request: IncomingMessage) => void): this;
    removeListener(event: "close" | "listening", cb: () => void): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
}
declare class KeepAliveServer extends WebSocketServer {
    connections: {
        [id: string]: Connection;
    };
    remoteAddressToConnections: {
        [address: string]: Connection[];
    };
    commands: {
        [command: string]: (context: WSContext) => Promise<void>;
    };
    globalMiddlewares: SocketMiddleware[];
    middlewares: {
        [key: string]: SocketMiddleware[];
    };
    rooms: {
        [roomName: string]: Set<string>;
    };
    serverOptions: KeepAliveServerOptions;
    constructor(opts: KeepAliveServerOptions);
    private cleanupConnection;
    private applyListeners;
    broadcast(command: string, payload: any, connections?: Connection[]): void;
    /**
     * Given a Connection, broadcasts only to all other Connections that share
     * the same connection.remoteAddress.
     *
     * Use cases:
     *  - Push notifications.
     *  - Auth changes, e.g., logging out in one tab should log you out in all tabs.
     */
    broadcastRemoteAddress(c: Connection, command: string, payload: any): void;
    /**
     * Given a roomName, a command and a payload, broadcasts to all Connections
     * that are in the room.
     */
    broadcastRoom(roomName: string, command: string, payload: any): void;
    /**
     * Given a connection, broadcasts a message to all connections except
     * the provided connection.
     */
    broadcastExclude(connection: Connection, command: string, payload: any): void;
    /**
     * @example
     * ```typescript
     * server.registerCommand("join:room", async (payload: { roomName: string }, connection: Connection) => {
     *   server.addToRoom(payload.roomName, connection);
     *   server.broadcastRoom(payload.roomName, "joined", { roomName: payload.roomName });
     * });
     * ```
     */
    addToRoom(roomName: string, connection: Connection): void;
    removeFromRoom(roomName: string, connection: Connection): void;
    /**
     * Returns a "room", which is simply a Set of Connection ids.
     * @param roomName
     */
    getRoom(roomName: string): Connection[];
    clearRoom(roomName: string): void;
    registerCommand(command: string, callback: SocketMiddleware, middlewares?: SocketMiddleware[]): void;
    addMiddlewareToCommand(command: string, middlewares: SocketMiddleware[]): void;
    private runCommand;
}

export { Connection, KeepAliveServer, KeepAliveServerOptions, SocketMiddleware, WSContext };
