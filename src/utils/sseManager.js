class SSEManager {
    constructor() {
        // userId → Set<Response>
        this.clients = new Map();
    }

    add(userId, res) {
        if (!this.clients.has(userId)) {
            this.clients.set(userId, new Set());
        }
        this.clients.get(userId).add(res);
    }

    remove(userId, res) {
        const conns = this.clients.get(userId);
        if (!conns) return;
        conns.delete(res);
        if (conns.size === 0) this.clients.delete(userId);
    }

    send(userId, data) {
        const conns = this.clients.get(userId);
        if (!conns || conns.size === 0) return;

        const payload = `data: ${JSON.stringify(data)}\n\n`;
        const dead = [];

        for (const res of conns) {
            try {
                res.write(payload);
            } catch {
                // Conexão fechada antes do evento de close ser disparado
                dead.push(res);
            }
        }

        for (const res of dead) {
            conns.delete(res);
        }
        if (conns.size === 0) this.clients.delete(userId);
    }
}

export const sseManager = new SSEManager();
