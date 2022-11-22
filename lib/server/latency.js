export class Latency {
    constructor() {
        this.start = 0;
        this.end = 0;
        this.ms = 0;
    }
    onRequest() {
        this.start = Date.now();
    }
    onResponse() {
        this.end = Date.now();
        this.ms = this.end - this.start;
    }
}
//# sourceMappingURL=latency.js.map