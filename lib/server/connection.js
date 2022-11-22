import EventEmitter from "node:events";
import { bufferToCommand } from "./command";
import { Latency } from "./latency";
import { Ping } from "./ping";
export class Connection extends EventEmitter {
    constructor(socket, req, options) {
        super();
        this.alive = true;
        this.socket = socket;
        this.id = req.headers["sec-websocket-key"];
        this.remoteAddress = req.socket.remoteAddress;
        this.options = options;
        this.applyListeners();
        this.startIntervals();
    }
    startIntervals() {
        this.latency = new Latency();
        this.ping = new Ping();
        this.latency.interval = setInterval(() => {
            if (!this.alive) {
                return;
            }
            if (typeof this.latency.ms === "number") {
                this.send({ command: "latency", payload: this.latency.ms });
            }
            this.latency.onRequest();
            this.send({ command: "latency:request", payload: {} });
        }, this.options.latencyInterval);
        this.ping.interval = setInterval(() => {
            if (!this.alive) {
                this.emit("close");
            }
            this.alive = false;
            this.send({ command: "ping", payload: {} });
        }, this.options.pingInterval);
    }
    stopIntervals() {
        clearInterval(this.latency.interval);
        clearInterval(this.ping.interval);
    }
    applyListeners() {
        this.socket.on("close", () => {
            this.emit("close");
        });
        this.socket.on("message", (buffer) => {
            const command = bufferToCommand(buffer);
            if (command.command === "latency:response") {
                this.latency.onResponse();
            }
            else if (command.command === "pong") {
                this.alive = true;
                return;
            }
            this.emit("message", buffer);
        });
    }
    send(cmd) {
        this.socket.send(JSON.stringify(cmd));
    }
}
//# sourceMappingURL=connection.js.map