'use strict';

Vue.component('file-item', {
  props: ['name'],
  template: `<div>
    File: {{ name }}
  </div>`
});

// Component to list a single directory
Vue.component('directory-item', {
  props: ['path', 'tree', 'subDirectories'],
  // TODO - add icon for open/close
  template: `<div>
    <div>
      Directory: {{ directoryName }}
      <span v-if="files.length > 0 || subDirectories.length > 0" :click="toggleContents()">
        <span v-if="isOpen">
          Close
        </span>
        <span v-else>
          Open
        </span>
      </span>
    </div>

    <div v-if="isOpen">
      <div v-for "subDirectory in subDirectories">
        <directory-ite
          :name="subDirectory"
          :tree="tree"
          :subdirectories="subdirectories"
        >
        </directory-item>
      </div>
      <div v-for="file in files">
        <file-item :name="file"></file-item>
      </div>
    </div>
  </div>`,
  data: {
    isOpen: false
  },
  computed: {
    directoryName() {
      const parts = this.path.split('/')
      return parts[parts.length - 1]
    },
    childDirectories() {
      return this.subDirectories[this.path]
    },
    files() {
      return this.tree[this.path]
    }
  },
  methods: {
    toggleContents() {
      this.isOpen = !this.isOpen
    }
  }
});

// Initialize the Vue app.
const app = new Vue({
  el: '#app',
  data: {
    tree: {},
    directoryPaths: []
  },
  computed: {
    directories: {
      get() {
        return Object.keys(this.tree).sort();
      },
      set() {
        return Object.keys(this.tree).sort();
      }
    },
    subDirectories: {
      get() {
        return directories.reduce((tree, directory) => {
          // It's a root directory, just initialize the array.
          if (parents.includes(directory)) {
            tree[directory] = []
          } else {
            // It's a sub directory, so push it to the array of its parent
            const parts =  directory.split('/')
            const parent = parts.slice(0, parts.length -2).join('/')
      
            tree[parent] = tree[parent] || []
            tree[parent].push(directory)
          }
      
          return tree
        }, {})
      },
      // We never actually set this value...
      set(value) {
        return vlue
      } 
    }
  },
  // On mounted, connect to the socket, grab initial state
  // Then listen for further changes.
  mounted() {
    const socket = io('http://localhost:3000');

    socket.on('init', ({ tree, directoryPaths }) => {
      this.tree = Object.assign({}, tree);
      // Directory paths shouldn't change.
      this.directoryPaths = directoryPaths;
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
      update[directory] = [...this.tree[directory], filename];

      this.tree = Object.assign({}, this.tree, update);
    },
    removeFile({ filename, directory }) {
      const update = {};
      update[directory] = this.tree[directory].filter(fname => fname !== filename);

      this.tree = Object.assign({}, this.tree, update);
    },
    addDirectory({ directory }) {
      const update = {};
      update[directory] = [];

      this.tree = Object.assign({}, this.tree, update);
    },
    removeDirectory({ directory }) {
      const update = delete this.tree[directory];

      this.tree = Object.assign({}, this.tree, update);
    }
  }
});
