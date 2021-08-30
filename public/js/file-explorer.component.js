'use strict';

Vue.component('file-item', {
  props: ['name', 'tree'],
  template: `<div>
    File: {{ name }

    Files: {{ files }}
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
  props: ['name'],
  // TODO - add button to open/close
  template: `<div>
    Item: {{ name }}

    <div></div>
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
