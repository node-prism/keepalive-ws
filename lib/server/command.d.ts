/// <reference types="node" />
export interface Command {
    id?: number;
    command: string;
    payload: any;
}
export declare const bufferToCommand: (buffer: Buffer) => Command;
//# sourceMappingURL=command.d.ts.map