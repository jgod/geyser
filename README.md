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
    
    geyser install -p ./package.json

#### Using a single dependency listed in the current directory's geyser.json
    
    geyser installs <package>

#### Using a single dependency listed in some other .json file

    geyser installs <package> -p ./package.json

### Defining a Package

#### geyser.json
Create a `geyser.json` and specify all of your environment's dependencies with metadata:

    {
      "name": "my-project",
      "version": "1.0.0",
      "dependencies": {
        "bower": "latest",
        "grunt": "0.4.2",
        "coffee-script": "*"
      }
    }

#### Another .json file
You can leave out name and version, but `dependencies` must change to `globalDependencies`, to avoid likely clashes (like in the case of npm's `package.json`):    

    {
      "globalDependencies" : {
        "bower": "latest",
        "grunt": "0.4.2",
        "coffee-script": "*"
      }
    }

## License
Copyright 2014 Justin Godesky.
Released under the MIT License.