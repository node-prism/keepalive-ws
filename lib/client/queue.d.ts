export declare class QueueItem {
    value: any;
    expireTime: number;
    constructor(value: any, expiresIn: number);
    get expiresIn(): number;
    get isExpired(): boolean;
}
export declare class Queue {
    items: any[];
    add(item: any, expiresIn: number): void;
    get isEmpty(): boolean;
    pop(): QueueItem | null;
}
//# sourceMappingURL=queue.d.ts.map