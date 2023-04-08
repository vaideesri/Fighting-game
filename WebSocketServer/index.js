// Import the 'ws' module
const WebSocket = require('ws');

// Create a map to store connected clients
const clients = new Map();

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Handle incoming WebSocket connections
wss.on('connection', (ws, req) => {
  // Extract the client ID from the connection request
  const clientId = req.url.split('/')[1];

  // Add the client to the map of connected clients
  clients.set(clientId, ws);

  console.log(`Client ${clientId} connected`);
  let receiver = clients.get(getReceiverID(clientId));

  if(clientId.length ==4){
       receiver?.send('Allow Start Game');
  }
  
  // Handle incoming messages from the client
  ws.on('message', (message) => {
    console.log(`Received message from client ${clientId}: ${message}`);

    let receiver = clients.get(getReceiverID(clientId));
    // Send a response to the client
    receiver?.send('' + message);
  });

  // Handle WebSocket disconnections
  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`Client ${clientId} disconnected`);
  });

  // Handle WebSocket errors
  ws.on('error', (error) => {
    console.error(`WebSocket error occurred for client ${clientId}: ${error.message}`);
    // Optionally, you can close the WebSocket connection on error
    // ws.close();
  });
});

// Handle WebSocket server errors
wss.on('error', (error) => {
  console.error(`WebSocket server error occurred: ${error.message}`);
});

const getReceiverID = function(clientId){
  return clientId.length == 3 ? clientId + "1" : clientId.substring(0, 3);
}