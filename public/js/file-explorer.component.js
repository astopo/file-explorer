'use strict';

Vue.component('file-item', {
  props: ['name'],
  template: `<div>
    File: {{ name }}
  </div>`,
  computed: {
    files() {
      console.log('this.tree', this.tree)
      return JSON.stringify(this.tree[this.name])
    }
  }
})

// Component to list a single directory
Vue.component('directory-item', {
  props: ['name', 'files'],
  // TODO - add button to open/close
  template: `<div>
    Directory: {{ name }}

    <div v-for="file in files">
      <file-item :name="file"></file-item>
    </div>
  </div>`
})


const app = new Vue({
  el: '#app',
  data: {
    tree: {}
  },
  computed: {
    directories: {
      get() {
        return Object.keys(this.tree)
      },
      set() {
        return Object.keys(this.tree)
      }
    }
  },
  // On mounted, connect to the socket, grab initial state
  // Then listen for further changes.
  mounted() {
    const socket = io('http://localhost:3000')

    socket.on('init', ({ tree, directoryPaths }) => {
      console.log('initial data', tree, directoryPaths);

      this.tree = tree
      this.directories = directoryPaths
    })

    socket.on('fileAdded', ({ filename, directory }) => {
      // TODO
      console.log('fileAdded')
    })

    socket.on('fileDeleted', ({ filename, directory }) => {
      // TODO
    })

    socket.on('directoryAdded', ({ directory }) => {
      // TODO
    })

    socket.on('directoryDeleted', ({ directory }) => {
      // TODO
    })
  },
  methods: {

  }
})
