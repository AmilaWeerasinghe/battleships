const express = require('express');
const path = require('path');
const http = require('http');
const PORT = process.env.PORT || 3000; 
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// public folder contains the client side code
// the backend server will serve the client side code which is inside the public folder
// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle a socket connection request from web client
// to add a socket connection change the html of client

const connections = [null, null]; // only allow 2 players to connect
io.on('connection', socket => {
    console.log('New WS Connection...');

    //Find an available player number
    let playerIndex = -1;
    // search for the first null connection
    // niether of connections is null playerIndex will remain -1
    // else playerIndex will be the index of the null connection
    for ( const i in connections) {
        if(connections[i] === null) {
            playerIndex = i;
            break;
        }
    }

    // Tell the connecting client what player number they are
    socket.emit('player-number', playerIndex);

    console.log(`Player ${playerIndex} has connected`);

    // ignore player 3
    if(playerIndex === -1) return;
});