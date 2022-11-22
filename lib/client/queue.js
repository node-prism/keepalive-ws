export class QueueItem {
    constructor(value, expiresIn) {
        this.value = value;
        this.expireTime = Date.now() + expiresIn;
    }
    get expiresIn() {
        return this.expireTime - Date.now();
    }
    get isExpired() {
        return Date.now() > this.expireTime;
    }
}
export class Queue {
    constructor() {
        this.items = [];
    }
    add(item, expiresIn) {
        this.items.push(new QueueItem(item, expiresIn));
    }
    get isEmpty() {
        let i = this.items.length;
        while (i--) {
            if (this.items[i].isExpired) {
                this.items.splice(i, 1);
            }
            else {
                return false;
            }
        }
        return true;
    }
    pop() {
        while (this.items.length) {
            const item = this.items.shift();
            if (!item.isExpired) {
                return item;
            }
        }
        return null;
    }
}
//# sourceMappingURL=queue.js.map