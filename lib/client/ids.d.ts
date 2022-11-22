export declare class IdManager {
    ids: Array<true | false>;
    index: number;
    maxIndex: number;
    constructor(maxIndex?: number);
    release(id: number): void;
    reserve(): number;
}
//# sourceMappingURL=ids.d.ts.map