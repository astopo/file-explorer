const args = process.argv

const chokidar = require('chokidar')

class Watcher {
  constructor() {
    // The first 2 args are always node and the path to this file.
    // We only care about the args thereafter.
    this.directoryPaths = args.slice(2, args.length)
    this.watcher = null

    this.tree = {}
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
  }

  onChange(path) {
    console.log(`path ${path} changed`)
  }

  onUnlink(path) {
    console.log(`path ${path} unlinked`)

    const { filename, directory } = this._getFilePathAndDirectory(path)

    this.tree[directory] = this.tree[directory].filter(fname => fname !== filename)
  }

  onAddDir(path) {
    console.log(`Directory ${path} has been added`)
    // Add a key to the tree
    this.tree[path] = []
  }

  onUnlinkDir(path) {
    console.log(`Directory ${path} has been removed`)
    // Remove the directory from the tree.
    delete this.tree[path]
  }

  onError(error) {
    console.log(`Watcher error: ${error}`)
  }

  _getFilePathAndDirectory(path) {
    const parts = path.split('/')

    const filename = parts[parts.length - 1]
    const directory = parts.slice(0, parts.length - 1).join('/')

    return { filename, directory }
  }
}

module.exports = Watcher
