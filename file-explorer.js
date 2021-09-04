const Watcher = require('./services/watcher')
const watcher = new Watcher({ onFileAdded, onFileDeleted, onDirectoryAdded, onDirectoryDeleted })

// Start the watcher.
watcher.watch()


// Server setup
const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)

// Serve static files from public directory
app.use(express.static('public'))

// Set the default route to file-explorer.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/file-explorer.html')
})

// Have the websocket server ready to handle new connections
io.on('connection', (socket) => {
  // Send the current tree and directoryPaths.
  socket.emit('init', { tree: watcher.tree, directoryPaths: watcher.directoryPaths })
})

// Start the server.
server.listen(3000, () => {
  console.log('Server listening on *:3000. Navigate to localhost:3000 in your browser.');
})


// Callbacks for watcher that emit the changes to the client.

function onFileAdded({ filename, directory }) {
  io.emit('fileAdded', { filename, directory })
}

function onFileDeleted({ filename, directory }) {
  io.emit('fileDeleted', { filename, directory })
}

function onDirectoryAdded({ directory }) {
  io.emit('directoryAdded', { directory })
}

function onDirectoryDeleted({ directory }) {
  io.emit('directoryDeleted', { directory })
}
