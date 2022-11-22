import { WebSocket, WebSocketServer } from "ws";
import { bufferToCommand } from "./command";
import { Connection } from "./connection";
export class WSContext {
    constructor(wss, connection, payload) {
        this.wss = wss;
        this.connection = connection;
        this.payload = payload;
    }
}
export class KeepAliveServer extends WebSocketServer {
    constructor(opts) {
        super({ ...opts });
        this.connections = {};
        this.remoteAddressToConnections = {};
        this.commands = {};
        this.globalMiddlewares = [];
        this.middlewares = {};
        this.rooms = {};
        this.serverOptions = {
            ...opts,
            pingInterval: opts.pingInterval ?? 30000,
            latencyInterval: opts.latencyInterval ?? 5000,
        };
        this.applyListeners();
    }
    cleanupConnection(c) {
        c.stopIntervals();
        delete this.connections[c.id];
        this.remoteAddressToConnections[c.remoteAddress] = this.remoteAddressToConnections[c.remoteAddress].filter((cn) => cn.id !== c.id);
        if (!this.remoteAddressToConnections[c.remoteAddress].length) {
            delete this.remoteAddressToConnections[c.remoteAddress];
        }
    }
    applyListeners() {
        this.on("connection", (socket, req) => {
            const connection = new Connection(socket, req, this.serverOptions);
            this.connections[connection.id] = connection;
            this.emit("connected", connection);
            connection.once("close", () => {
                this.cleanupConnection(connection);
                this.emit("close", connection);
                if (socket.readyState === WebSocket.OPEN) {
                    socket.close();
                }
                Object.keys(this.rooms).forEach((roomName) => {
                    this.rooms[roomName].delete(connection.id);
                });
            });
            connection.on("message", (buffer) => {
                try {
                    const { id, command, payload } = bufferToCommand(buffer);
                    this.runCommand(id ?? 0, command, payload, connection);
                }
                catch (e) {
                    this.emit("error", e);
                }
            });
        });
    }
    broadcast(command, payload, connections) {
        const cmd = JSON.stringify({ command, payload });
        if (connections) {
            connections.forEach((c) => {
                c.socket.send(cmd);
            });
            return;
        }
        Object.values(this.connections).forEach((c) => {
            c.socket.send(cmd);
        });
    }
    /**
     * Given a Connection, broadcasts only to all other Connections that share
     * the same connection.remoteAddress.
     *
     * Use cases:
     *  - Push notifications.
     *  - Auth changes, e.g., logging out in one tab should log you out in all tabs.
     */
    broadcastRemoteAddress(c, command, payload) {
        const cmd = JSON.stringify({ command, payload });
        this.remoteAddressToConnections[c.remoteAddress].forEach((cn) => {
            cn.socket.send(cmd);
        });
    }
    /**
     * Given a roomName, a command and a payload, broadcasts to all Connections
     * that are in the room.
     */
    broadcastRoom(roomName, command, payload) {
        const cmd = JSON.stringify({ command, payload });
        const room = this.rooms[roomName];
        if (!room)
            return;
        room.forEach((connectionId) => {
            const connection = this.connections[connectionId];
            if (connection) {
                connection.socket.send(cmd);
            }
        });
    }
    /**
     * @example
     * ```typescript
     * server.registerCommand("join:room", async (payload: { roomName: string }, connection: Connection) => {
     *   server.addToRoom(payload.roomName, connection);
     *   server.broadcastRoom(payload.roomName, "joined", { roomName: payload.roomName });
     * });
     * ```
     */
    addToRoom(roomName, connection) {
        this.rooms[roomName] = this.rooms[roomName] ?? new Set();
        this.rooms[roomName].add(connection.id);
    }
    removeFromRoom(roomName, connection) {
        if (!this.rooms[roomName])
            return;
        this.rooms[roomName].delete(connection.id);
    }
    /**
     * Returns a "room", which is simply a Set of Connection ids.
     * @param roomName
     */
    getRoom(roomName) {
        return this.rooms[roomName];
    }
    clearRoom(roomName) {
        this.rooms[roomName] = new Set();
    }
    registerCommand(command, callback, ...middlewaares) {
        this.commands[command] = callback;
        this.addMiddlewareToCommand(command, ...middlewaares);
    }
    addMiddlewareToCommand(command, ...middlewares) {
        if (middlewares.length) {
            this.middlewares[command] = this.middlewares[command] || [];
            this.middlewares[command] = middlewares.concat(this.middlewares[command]);
        }
    }
    async runCommand(id, command, payload, connection) {
        const c = new WSContext(this, connection, payload);
        try {
            if (!this.commands[command]) {
                // An onslaught of commands that don't exist is a sign of a bad
                // or otherwise misconfigured client.
                throw new Error(`Command [${command}] not found.`);
            }
            if (this.globalMiddlewares.length) {
                for (const mw of this.globalMiddlewares) {
                    await mw(c);
                }
            }
            if (this.middlewares[command]) {
                for (const mw of this.middlewares[command]) {
                    await mw(c);
                }
            }
            const result = await this.commands[command](c);
            connection.send({ id, command, payload: result });
        }
        catch (e) {
            const payload = { error: e.message ?? e ?? "Unknown error" };
            connection.send({ id, command, payload });
        }
    }
}
export { Connection };
//# sourceMappingURL=index.js.map