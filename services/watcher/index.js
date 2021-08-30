const args = process.argv

const chokidar = require('chokidar')

/*
 * A class for loading and watching changes in directories.
 */
class Watcher {
  constructor({ onFileAdded, onFileDeleted, onDirectoryAdded, onDirectoryDeleted }) {
    // The first 2 args are always node and the path to this file.
    // We only care about the args thereafter.
    this._directoryPaths = args.slice(2, args.length)
    this.watcher = null

    // We track our own tree for when clients first connect
    this._tree = {}

    // But emit events for every change so that we don't
    // have to send the whole tree every time.
    this.onFileAdded = onFileAdded
    this.onFileDeleted = onFileDeleted
    this.onDirectoryAdded = onDirectoryAdded
    this.onDirectoryDeleted = onDirectoryDeleted
  }

  get directoryPaths() {
    return this._directoryPaths
  }

  get tree() {
    return this._tree
  }

  watch() {
    this.watcher = chokidar.watch(this.directoryPaths)

    this.watcher
      .on('add', path => this.onAdd(path))
      .on('change', path => this.onChange(path))
      .on('unlink', path => this.onUnlink(path))
      .on('addDir', path => this.onAddDir(path))
      .on('unlinkDir', path => this.onUnlinkDir(path))
      .on('error', error => this.onError(error))
      .on('ready', () => console.log('Initial scan complete. Ready for changes tree:', this._tree))
  }

  onAdd(path) {
    console.log(`path ${path} added`)

    const { filename, directory } =this._getFilePathAndDirectory(path)

    this._tree[directory] = this._tree[directory] || []
    this._tree[directory] = [...this._tree[directory], filename]

    this.onFileAdded({ filename, directory })
  }

  onChange(path) {
    console.log(`path ${path} changed`)
    // This is irrelevant to the tree if the contents of a file are changed, do nothing.
  }

  // Emitted when a file is deleted or renamed
  // Only need to remove it from the tree because
  // if it was renamed, the 'add' event will also fire
  onUnlink(path) {
    console.log(`path ${path} unlinked`)

    const { filename, directory } = this._getFilePathAndDirectory(path)

    this._tree[directory] = this._tree[directory].filter(fname => fname !== filename)

    this.onFileDeleted({ filename, directory })
  }

  onAddDir(path) {
    console.log(`Directory ${path} has been added`)
    // Add a key to the tree
    this._tree[path] = []

    this.onDirectoryAdded({ directory: path })
  }

  onUnlinkDir(path) {
    console.log(`Directory ${path} has been removed`)
    // Remove the directory from the tree.
    delete this._tree[path]

    this.onDirectoryDeleted({ directory: path })
  }

  onError(error) {
    console.log(`Watcher error: ${error}`)
  }

  // Returns the filename and directory for a given path
  _getFilePathAndDirectory(path) {
    const parts = path.split('/')

    const filename = parts[parts.length - 1]
    const directory = parts.slice(0, parts.length - 1).join('/')

    return { filename, directory }
  }
}

module.exports = Watcher
