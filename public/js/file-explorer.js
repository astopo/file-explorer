'use strict';

// Helper method to extract name only from a given path.
function getNameFromPath(path) {
  const parts = path.split('/');
  const name = parts[parts.length - 1];

  return name;
}

// Store for shared state from scratch because this is a simple app.
const store = {
  state: {
    tree: {},
    treeview: [],
    directoryPaths: [],
    directories: [],
    subdirectories: {}
  },
  setDirectoryPaths(newValue) {
    this.state.directoryPaths = newValue;
  },
  updateTree (update) {
    this.state.tree = Object.assign({}, this.state.tree, update);
    // When the tree is updated, also update directories & subdirectories
    this.setDirectories();
    this.setSubdirectories();

    this.setTreeview();
  },
  setDirectories () {
    this.state.directories = Object.keys(this.state.tree).sort();
  },
  setSubdirectories () {
    this.state.subdirectories = this.state.directories.reduce((tree, directory) => {
      // It's a root directory, just initialize the array.
      if (this.state.directoryPaths.includes(directory)) {
        tree[directory] = [];
      } else {
        // It's a sub directory, so push it to the array of its parent
        const parts = directory.split('/');
        const parent = parts.slice(0, parts.length - 1).join('/');

        tree[parent] = tree[parent] || [];
        tree[parent].push(directory);
      }

      return tree;
    }, {});
  },
  _getChildren({ directory, currentId }) {
    const files = this.state.tree[directory] || [];
    const subdirectories = this.state.subdirectories[directory] || [];

    // Sort files by name, then format for the treeview
    const formattedFiles = files.sort().map(file => {
      currentId = currentId + 1;

      return {
        id: currentId,
        name: file,
        children: []
      };
    })

    // Recursively get children for subdirs.
    const formattedDirectories = subdirectories.sort().map(currentDirectory => {
      currentId = currentId + 1;
      const name = getNameFromPath(currentDirectory);
      const children = this._getChildren({ directory: currentDirectory, currentId });

      return {
        id: currentId,
        name,
        children
      }
    });

    return [...formattedDirectories, ...formattedFiles];
  },
  // Formats our tree for Vuetify's component
  setTreeview() {
    let currentId = 0;

    this.state.treeview = this.state.directoryPaths.reduce((treeview, currentDirectory) => {
      currentId = currentId + 1;
      const name = getNameFromPath(currentDirectory);

      const currentItem = { id: currentId, name, children: [] };

      currentItem.children = this._getChildren({ directory: currentDirectory, currentId });

      return [...treeview, currentItem];
    }, []);
  }
}

// Initialize the Vue app.
const app = new Vue({
  el: '#app',
  vuetify: new Vuetify(),
  data: {
    shared: store.state
  },
  // On mounted, connect to the socket, grab initial state
  // Then listen for further changes.
  mounted() {
    const socket = io('http://localhost:3000');

    socket.on('init', ({ tree, directoryPaths }) => {
      store.setDirectoryPaths(directoryPaths);
      store.updateTree(tree);
    });

    socket.on('fileAdded', ({ filename, directory }) => {
      this.addFile({ filename, directory });
    });

    socket.on('fileDeleted', ({ filename, directory }) => {
      this.removeFile({ filename, directory });
    });

    socket.on('directoryAdded', ({ directory }) => {
      this.addDirectory({ directory });
    });

    socket.on('directoryDeleted', ({ directory }) => {
      this.removeDirectory({ directory });
    });
  },
  methods: {
    addFile({ filename, directory }) {
      const update = {};
      update[directory] = [...this.shared.tree[directory], filename];

      store.updateTree(update);
    },
    removeFile({ filename, directory }) {
      const update = {};
      update[directory] = this.shared.tree[directory].filter(fname => fname !== filename);

      store.updateTree(update);
    },
    addDirectory({ directory }) {
      const update = {};
      update[directory] = [];

      store.updateTree(update);
    },
    removeDirectory({ directory }) {
      const update = delete this.shared.tree[directory];

      store.updateTree(update);
    }
  }
});
