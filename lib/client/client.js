import { Connection } from "./connection";
const defaultOptions = (opts = {}) => {
    opts.pingTimeout = opts.pingTimeout ?? 30000;
    opts.maxLatency = opts.maxLatency ?? 2000;
    opts.shouldReconnect = opts.shouldReconnect ?? true;
    opts.reconnectInterval = opts.reconnectInterval ?? 2000;
    opts.maxReconnectAttempts = opts.maxReconnectAttempts ?? Infinity;
    return opts;
};
export class KeepAliveClient extends EventTarget {
    constructor(url, opts = {}) {
        super();
        this.isReconnecting = false;
        this.url = url;
        this.socket = new WebSocket(url);
        this.connection = new Connection(this.socket);
        this.options = defaultOptions(opts);
        this.applyListeners();
    }
    applyListeners() {
        this.connection.addEventListener("connection", () => {
            this.heartbeat();
        });
        this.connection.addEventListener("close", () => {
            this.reconnect();
        });
        this.connection.addEventListener("ping", () => {
            this.heartbeat();
        });
        this.connection.addEventListener("message", (ev) => {
            this.dispatchEvent(new CustomEvent("message", ev));
        });
    }
    heartbeat() {
        clearTimeout(this.pingTimeout);
        this.pingTimeout = setTimeout(() => {
            if (this.options.shouldReconnect) {
                this.reconnect();
            }
        }, this.options.pingTimeout + this.options.maxLatency);
    }
    async reconnect() {
        if (this.isReconnecting) {
            return;
        }
        this.isReconnecting = true;
        let attempt = 1;
        if (this.socket) {
            try {
                this.socket.close();
            }
            catch (e) { }
        }
        const connect = () => {
            this.socket = new WebSocket(this.url);
            this.socket.onerror = () => {
                attempt++;
                if (attempt <= this.options.maxReconnectAttempts) {
                    setTimeout(connect, this.options.reconnectInterval);
                }
                else {
                    this.isReconnecting = false;
                    this.connection.dispatchEvent(new Event("reconnectfailed"));
                    this.connection.dispatchEvent(new Event("reconnectionfailed"));
                }
            };
            this.socket.onopen = () => {
                this.isReconnecting = false;
                this.connection.socket = this.socket;
                this.connection.applyListeners(true);
                this.connection.dispatchEvent(new Event("connection"));
                this.connection.dispatchEvent(new Event("connected"));
                this.connection.dispatchEvent(new Event("connect"));
                this.connection.dispatchEvent(new Event("reconnection"));
                this.connection.dispatchEvent(new Event("reconnected"));
                this.connection.dispatchEvent(new Event("reconnect"));
            };
        };
        connect();
    }
    async command(command, payload, expiresIn, callback) {
        return this.connection.command(command, payload, expiresIn, callback);
    }
}
//# sourceMappingURL=client.js.map