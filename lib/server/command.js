export const bufferToCommand = (buffer) => {
    const decoded = new TextDecoder("utf-8").decode(buffer);
    if (!decoded) {
        return { id: 0, command: "", payload: {} };
    }
    try {
        const parsed = JSON.parse(decoded);
        return { id: parsed.id, command: parsed.command, payload: parsed.payload };
    }
    catch (e) {
        return { id: 0, command: "", payload: {} };
    }
};
//# sourceMappingURL=command.js.map