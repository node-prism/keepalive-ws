For a TCP-based, node-only solution with a similar API, see [duplex](https://github.com/node-prism/duplex).

# keepalive-ws

A command server and client for simplified WebSocket communication, with builtin ping and latency messaging.

Built for [grove](https://github.com/node-prism/grove), but works anywhere.

### Server

For node.

```typescript
import { KeepAliveServer, WSContext } from "@prsm/keepalive-ws/server";

const ws = new KeepAliveServer({
  path: "/",
  pingInterval: 30000,
  // Calculate round-trip time and send latency updates
  // to clients every 5s.
  latencyInterval: 5000,
});

ws.registerCommand(
  "authenticate",
  async (c: WSContext) => {
    // use c.payload to authenticate c.connection
    return { ok: true, token: "..." };
  },
);

ws.registerCommand(
  "throws",
  async (c: WSContext) => {
    throw new Error("oops");
  },
);
```

Other things:

- Rooms
  - `addToRoom(roomName: string, connection: Connection): void`
  - `removeFromRoom(roomName: string, connection: Connection): void`
  - `getRoom(roomName: string): Connection[]`
  - `clearRoom(roomName: string): void`
- Command middleware
- Broadcasting to:
  - all
    - `broadcast(command: string, payload: any, connections?: Connection[]): void`
  - all connections that share the same IP
    - `broadcastRemoteAddress(c: Connection, command: string, payload: any): void`
  - rooms
    - `broadcastRoom(roomName: string, command: string, payload: any): void`

### Client

For the browser.

```typescript
import { KeepAliveClient } from "@prsm/keepalive-ws/client";

const ws = new KeepAliveClient("ws://localhost:8080");

const { ok, token } = await ws.command("authenticate", {
  username: "user",
  password: "pass",
});

const result = await ws.command("throws", {});
// result is: { error: "oops" }

ws.connection.addEventListener("latency", (e) => {
  // e.detail.payload is round-trip time in ms
});
```
