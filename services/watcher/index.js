const args = process.argv

const chokidar = require('chokidar')

class Watcher {
  constructor({ onTreeUpdated }) {
    // The first 2 args are always node and the path to this file.
    // We only care about the args thereafter.
    this.directoryPaths = args.slice(2, args.length)
    this.watcher = null

    this.tree = {}

    // A function here to be called every time the tree is updated.
    this._onTreeUpdated = onTreeUpdated
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
      .on('ready', () => console.log('Initial scan complete. Ready for changes tree:', this.tree))
  }

  onAdd(path) {
    console.log(`path ${path} added`)

    const { filename, directory } =this._getFilePathAndDirectory(path)

    this.tree[directory] = this.tree[directory] || []
    this.tree[directory] = [...this.tree[directory], filename]

    this._onTreeUpdated(this.tree)
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

    this.tree[directory] = this.tree[directory].filter(fname => fname !== filename)

    this._onTreeUpdated(this.tree)
  }

  onAddDir(path) {
    console.log(`Directory ${path} has been added`)
    // Add a key to the tree
    this.tree[path] = []

    this._onTreeUpdated(this.tree)
  }

  onUnlinkDir(path) {
    console.log(`Directory ${path} has been removed`)
    // Remove the directory from the tree.
    delete this.tree[path]

    this._onTreeUpdated(this.tree)
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
