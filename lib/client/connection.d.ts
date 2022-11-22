import { IdManager } from "./ids";
import { Queue } from "./queue";
type Command = {
    id?: number;
    command: string;
    payload?: any;
};
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