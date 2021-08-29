const Watcher = require('./services/watcher')
const watcher = new Watcher({ onFileAdded, onFileDeleted, onDirectoryAdded, onDirectoryRemoved })

// Start the watcher.
watcher.watch()


const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/file-explorer.html');
})

io.on('connection', (socket) => {
  console.log('a user connected')
  // Send the current tree and directoryPaths.
  socket.emit('init', { tree: watcher.tree, directoryPaths: watcher.directoryPaths })
})

server.listen(3000, () => {
  console.log('Server listening on *:3000');
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

function onDirectoryRemoved({ directory }) {
  io.emit('directoryRemoved', { directory })
}
