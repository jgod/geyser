# Geyser

Geyser is a global package manager for [npm](http://npmjs.org). It offers a generic solution to the problem of **global package management**.

Geyser runs over npm itself, and is package-agnostic.

## Installing

Geyser depends on [Node](http://nodejs.org) and npm. It should be installed globally:

    sudo npm install -g geyser

## Usage

### Installing Packages

#### Using the dependencies listed in the current directory's geyser.json

    geyser install

#### Using the dependencies listed in some other .json file
    
    geyser install using ~/Dropbox/dev/node-globals.json

### Defining a Package
You must create a `geyser.json` and specify all of your environment's dependencies with optional metadata.

You can interactively create a `geyser.json` with the following command:
  
    geyser init

The `geyser.json` defines several options:

  * `name`: The name of your package.
  * `version`: A semantic version number. (see [semver](http://semver.org))
  * `dependencies` [hash]: Packages your package depends on.

```
  {
    "name": "my-project",
    "version": "1.0.0",
    "dependencies": {
      "bower": "latest",
      "grunt": "0.4.2",
      "coffee-script": "*"
    }
  }
```

## License
Copyright 2014 Justin Godesky.
Released under the MIT License.