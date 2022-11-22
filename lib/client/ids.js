export class IdManager {
    constructor(maxIndex = 2 ** 16 - 1) {
        this.ids = [];
        this.index = 0;
        this.maxIndex = maxIndex;
    }
    release(id) {
        if (id < 0 || id > this.maxIndex) {
            throw new TypeError(`ID must be between 0 and ${this.maxIndex}. Got ${id}.`);
        }
        this.ids[id] = false;
    }
    reserve() {
        const startIndex = this.index;
        while (true) {
            const i = this.index;
            if (!this.ids[i]) {
                this.ids[i] = true;
                return i;
            }
            if (this.index >= this.maxIndex) {
                this.index = 0;
            }
            else {
                this.index++;
            }
            if (this.index === startIndex) {
                throw new Error(`All IDs are reserved. Make sure to release IDs when they are no longer used.`);
            }
        }
    }
}
//# sourceMappingURL=ids.js.map