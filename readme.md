# File Explorer

A "vs-code like" file explorer tree view with multiple collapsible sections.

Takes as an argument one or multiple paths to local directories. Each directory is represented as an independent section in the rendered file explorer. When a file on the host is deleted, added, removed or renamed within one of the specified directories, changes are reflected in the rendered file explorer.

## Getting started

Install dependencies:

```
yarn install
```

## Run the script

```
node ./file-explorer.js PATH_TO_DIRECTORY_1 PATH_TO_DIRECTORY_2
```

Open up the file explorer at `localhost:3000`.