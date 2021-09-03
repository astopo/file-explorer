'use strict';
const store = {
  state: {
    tree: {},
    directoryPaths: [],
    directories: [],
    subdirectories: {}
  },
  setDirectoryPaths(newValue) {
    this.state.directoryPaths = newValue
  },
  updateTree (update) {
    this.state.tree = Object.assign({}, this.state.tree, update)
    // When the tree is updated, also update directories & subdirectories
    this.setDirectories()
    this.setSubdirectories()
  },
  setDirectories () {
    this.state.directories = Object.keys(this.state.tree).sort()
  },
  setSubdirectories () {
    this.state.subdirectories = this.state.directories.reduce((tree, directory) => {
      // It's a root directory, just initialize the array.
      if (this.state.directoryPaths.includes(directory)) {
        tree[directory] = []
      } else {
        // It's a sub directory, so push it to the array of its parent
        const parts = directory.split('/')
        const parent = parts.slice(0, parts.length -2).join('/')

        tree[parent] = tree[parent] || []
        tree[parent].push(directory)
      }

      return tree
    }, {})
  }
}

Vue.component('file-item', {
  props: ['name'],
  template: `<div>
    File: {{ name }}
  </div>`
});

// Component to list a single directory
Vue.component('directory-item', {
  props: ['path'],
  // TODO - add icon for open/close
  template: `<div>
    <div>
      Directory: {{ directoryName }}
      <button v-if="(files && files.length > 0) || (currentSubdirectories && currentSubdirectories.length > 0)" v-on:click="toggleContents()">
        <span v-if="isOpen">
          Close
        </span>
        <span v-else>
          Open
        </span>
      </button>
    </div>

    <div v-if="isOpen">
      <div v-for="directory in currentSubdirectories">
        <directory-item
          :name="directory"
        >
        </directory-item>
      </div>
      <div v-for="file in files">
        <file-item :name="file"></file-item>
      </div>
    </div>
  </div>`,
  data: () => {
    return {
      isOpen: false,
      shared: store.state
    }
  },
  computed: {
    directoryName() {
      const parts = this.path.split('/')
      return parts[parts.length - 1]
    },
    currentSubdirectories() {
      return this.shared.subdirectories[this.path]
    },
    files() {
      return this.shared.tree[this.path]
    }
  },
  methods: {
    toggleContents() {
      console.log('toggling')
      this.isOpen = !this.isOpen;
    }
  }
});

// Initialize the Vue app.
const app = new Vue({
  el: '#app',
  data: {
    shared: store.state
  },
  // On mounted, connect to the socket, grab initial state
  // Then listen for further changes.
  mounted() {
    const socket = io('http://localhost:3000');

    socket.on('init', ({ tree, directoryPaths }) => {
      store.updateTree(tree);
      store.setDirectoryPaths(directoryPaths);
    });

    socket.on('fileAdded', ({ filename, directory }) => {
      this.addFile({ filename, directory });
    });

    socket.on('fileDeleted', ({ filename, directory }) => {
      this.removeFile({ filename, directory });
    });

    socket.on('directoryAdded', ({ directory }) => {
      console.log('adding dir')
      this.addDirectory({ directory });
    });

    socket.on('directoryDeleted', ({ directory }) => {
      this.removeDirectory({ directory });
    });
  },
  methods: {
    addFile({ filename, directory }) {
      const update = {};
      update[directory] = [...this.store.tree[directory], filename];

      store.updateTree(update);
    },
    removeFile({ filename, directory }) {
      const update = {};
      update[directory] = this.store.tree[directory].filter(fname => fname !== filename);

      store.updateTree(update);
    },
    addDirectory({ directory }) {
      const update = {};
      update[directory] = [];

      store.updateTree(update);
    },
    removeDirectory({ directory }) {
      const update = delete this.store.tree[directory];

      store.updateTree(update);
    }
  }
});
