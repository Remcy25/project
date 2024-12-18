const WebSocket = require("ws");
const port = process.env.PORT || 8080;
const server = new WebSocket.Server({ port });

let clients = [];
let grid = Array.from({ length: 6 }, () => Array(7).fill(0));
let currentPlayer = 1;

function broadcastGameState() {
    const message = JSON.stringify({ type: "update", grid, currentPlayer });
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

server.on("connection", (socket) => {
    clients.push(socket);
    socket.send(JSON.stringify({ type: "initialize", grid, currentPlayer }));

    socket.on("message", (data) => {
        const { type, column } = JSON.parse(data);
        if (type === "move") {
            for (let row = 5; row >= 0; row--) {
                if (grid[row][column] === 0) {
                    grid[row][column] = currentPlayer;
                    currentPlayer = currentPlayer === 1 ? 2 : 1;
                    break;
                }
            }
            broadcastGameState();
        }
    });

    socket.on("close", () => {
        clients = clients.filter(client => client !== socket);
    });
});

console.log(`WebSocket server running on port ${port}`);

