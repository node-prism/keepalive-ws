import { IdManager } from "./ids";
import { Queue } from "./queue";
export class Connection extends EventTarget {
    constructor(socket) {
        super();
        this.ids = new IdManager();
        this.queue = new Queue();
        this.callbacks = {};
        this.socket = socket;
        this.applyListeners();
    }
    sendToken(cmd, expiresIn) {
        try {
            this.socket.send(JSON.stringify(cmd));
        }
        catch (e) {
            this.queue.add(cmd, expiresIn);
        }
    }
    applyListeners(reconnection = false) {
        const drainQueue = () => {
            while (!this.queue.isEmpty) {
                const item = this.queue.pop();
                this.sendToken(item.value, item.expiresIn);
            }
        };
        if (reconnection)
            drainQueue();
        // @ts-ignore
        this.socket.onopen = (socket, ev) => {
            drainQueue();
            this.dispatchEvent(new Event("connection"));
            this.dispatchEvent(new Event("connected"));
            this.dispatchEvent(new Event("connect"));
        };
        this.socket.onclose = (event) => {
            this.dispatchEvent(new Event("close"));
            this.dispatchEvent(new Event("closed"));
            this.dispatchEvent(new Event("disconnected"));
            this.dispatchEvent(new Event("disconnect"));
        };
        this.socket.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                this.dispatchEvent(new CustomEvent("message", { detail: data }));
                if (data.command === "latency:request") {
                    this.dispatchEvent(new CustomEvent("latency:request", { detail: { latency: data.payload.latency ?? undefined } }));
                    this.command("latency:response", { latency: data.payload.latency ?? undefined }, null);
                }
                else if (data.command === "latency") {
                    this.dispatchEvent(new CustomEvent("latency", { detail: { latency: data.payload ?? undefined } }));
                }
                else if (data.command === "ping") {
                    this.dispatchEvent(new CustomEvent("ping", {}));
                    this.command("pong", {}, null);
                }
                else {
                    this.dispatchEvent(new CustomEvent(data.command, { detail: data.payload }));
                }
                if (this.callbacks[data.id]) {
                    this.callbacks[data.id](null, data.payload);
                }
            }
            catch (e) {
                this.dispatchEvent(new Event("error"));
            }
        };
    }
    async command(command, payload, expiresIn = 30000, callback = null) {
        const id = this.ids.reserve();
        const cmd = { id, command, payload };
        this.sendToken(cmd, expiresIn);
        if (expiresIn === null) {
            this.ids.release(id);
            delete this.callbacks[id];
            return;
        }
        const response = this.createResponsePromise(id);
        const timeout = this.createTimeoutPromise(id, expiresIn);
        if (typeof callback === "function") {
            const ret = await Promise.race([response, timeout]);
            callback(ret);
            return ret;
        }
        else {
            return Promise.race([response, timeout]);
        }
    }
    createTimeoutPromise(id, expiresIn) {
        return new Promise((_, reject) => {
            setTimeout(() => {
                this.ids.release(id);
                delete this.callbacks[id];
                reject(new Error(`Command ${id} timed out after ${expiresIn}ms.`));
            }, expiresIn);
        });
    }
    createResponsePromise(id) {
        return new Promise((resolve, reject) => {
            this.callbacks[id] = (error, result) => {
                this.ids.release(id);
                delete this.callbacks[id];
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            };
        });
    }
}
//# sourceMappingURL=connection.js.map