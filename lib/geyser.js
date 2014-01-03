#! /usr/bin/env node

var fs = require("fs")
var exec = require("child_process").exec;
var async = require("async");
var clc = require("cli-color");
var program = require("commander");
var promptly = require("promptly");

var info = clc.blue;
var warn = clc.yellow;
var error = clc.red.bold;

program
  .version("0.1.2")
  .option("init", "interactively create a geyser.json file")
  .option("install", "install described packages globally")
  .option("installs [package]", "install described package globally")
  .option("using [config file]", "use a custom config file path")
  .parse(process.argv);

String.prototype.replaceAll = function (find, replace) {
  var str = this;
  return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};

var Path = {
  retrieveFromCaller: function (program) {
    this.location = (program.using && program.using.length > 0) ? program.using : "geyser.json";
    this.pathType = (this.location === program.using) ? this.pathTypes.userDefined : this.pathTypes.local;
    return this.location;
  },
  determine: function (path) {
    var temp = (process.cwd() + "/" + path);
    this.location = temp;
    return this.location;
  },
  location: "", 
  pathType: 0,
  pathTypes: {local: 1, userDefined: 2}
}

var Config = {
  createInteractively: function () {
    Path.determine(Path.retrieveFromCaller(program));
    // Does a config file already exists here? Let's respect it as much as possible.
    var isModifying = false;
    try {
      this.data = require(Path.location);
      console.log(warn("Configuration file already exists at path: %s, entering append mode."), Path.location);
      isModifying = true;
    } catch (err) {
      console.log(info("Configuration file not found at path: %s, building new one there."), Path.location);
    }

    $this = this;
    // Temporary config to build with. Write it to file.
    var config = {};

    async.series([
      function (callback) {
        if (isModifying) {
          promptly.prompt("name: (current: " + $this.data.name + ")" , {default: $this.data.name}, 
            function (err, value) {callback(err, value);});
        } else {
          promptly.prompt("name: (default: my-globals)", {default: "my-globals"}, 
            function (err, value) {callback(err, value);});
        }
      },
      function (callback) {
        if (isModifying) {
          promptly.prompt("version: (current: " + $this.data.version + ")", {default: $this.data.version}, 
            function (err, value) {callback(err, value);});
        } else {
          promptly.prompt("version: (default: 1.0.0)", {default: "1.0.0"}, 
            function (err, value) {callback(err, value);});
        }

      },
      function (callback) {
        if (isModifying) {
          var terseDependencies = JSON.stringify($this.data.dependencies);
          terseDependencies = terseDependencies.replaceAll(":", "@")
                              .replaceAll("{", "")
                              .replaceAll("}", "")
                              .replaceAll("'", "")
                              .replaceAll("\"", "")
                              .replaceAll(",", " ");
          promptly.prompt("dependencies (current: " + terseDependencies + ")" , {default: terseDependencies}, 
            function (err, value) {callback(err, value);});
        } else {
          promptly.prompt("dependencies, space/comma delimited: (default: geyser@latest)", {default: "geyser@latest"}, 
            function (err, value) {callback(err, value);});
        }
      }
    ], 
    function (err, results) { 
      if (err) {
        console.log(error(err));
      } else {
        config.name = results[0];
        config.version = results[1];
        config.dependencies = {};

        var dependencies = results[2];
        dependencies = dependencies.replace(",", " ");
        dependencies = dependencies.trim();
        dependencies = dependencies.split(" ");

        Object.keys(dependencies).forEach(function (dependency) {
          var dependencyString = dependencies[dependency];
          var pkg = (dependencyString.search("@") !== -1) ? dependencyString.slice(0, dependencyString.search("@")) : dependencyString;
          var version = (dependencyString.search("@") !== -1) ? dependencyString.slice(dependencyString.search("@") + 1, dependencyString.length) : null;
          if (!version) version = "latest";
          if (pkg && version) config.dependencies[pkg] = version;
        })

        $this.write(config);
      }
    });
  },
  write: function (data) {
    var path = process.cwd() + "/geyser.json";
    var json = JSON.stringify(data, null, 2)
    fs.writeFile(path, json, function (err) {
      if (err) {
        console.log(err("Couldn't write geyser.json to %s"), path);
      } else {
        console.log(info("Wrote geyser.json to %s."), path);
      }
    });
  },
  data: {}
}

var Operation = {
  isStandalone: function () {
    if (this.opType === 0) {
      return null;
    }
    else return (this.opType === this.opTypes.init);
  },
  parse: function (program) {
    var operation = null;
    if (program.install) {
      operation = this.opTypes.installMulti;
    } else if (program.installs && program.installs.length > 0) { 
      operation = this.opTypes.installSingle;
    } else if (program.init) {
      operation = this.opTypes.init;
    }
    this.opType = operation;
    return operation;
  },
  // Used for operations that don't have packages necessarily attached.
  run: function () {
    switch (this.opType) {
      case (this.opTypes.init):
        Config.createInteractively();
        break;

      default:
        throw "Run type undefined.";
        break;
    }
  },
  runOnPackages: function () {
    var $this = this

    Object.keys(this.pkgs).forEach(function (pkg) {
      var command = "";
      var onCommandDone = function (err, stdout, stderr) {
        if (err) throw err;
        if (stdout) console.log(stdout);
        if (stderr) console.log(stderr);
      };

      switch ($this.opType) {
        case ($this.opTypes.installSingle):
        case ($this.opTypes.installMulti):
          command = ("npm install -g " + pkg + "@" + $this.pkgs[pkg]);
          break;

        default:
          throw "Run on packages type undefined.";
          break;
      }

      console.log(info("Running command: %s ..."), command);
      var child = exec(command, onCommandDone);
    })
  },
  opType: 0,
  opTypes: {init: 1, installMulti: 2, installSingle: 3},
  pkgs: []
}

// Treat operation and path types as enums.
Object.freeze(Operation.opTypes);
Object.freeze(Path.pathTypes);

Operation.parse(program);

if (Operation.parse(program) && !Operation.isStandalone()) {
  Path.determine(Path.retrieveFromCaller(program));

  // Do operations on dependencies as listed in config file.
  try {
    Config.data = require(Path.location);
  } catch (err) {
    console.log(error("Configuration file not found at specified path: %s!"), Path.location);
  }

  if (Config.data && Config.data.dependencies) {
    switch (Operation.opType) {
      case Operation.opTypes.installSingle:
        Operation.pkgs = Config.data.dependencies[program.installs];
      default:
        Operation.pkgs = Config.data.dependencies;
    }

    Operation.runOnPackages();
  } else {
    console.log(error("Couldn't find dependencies in configuration file: %s!"), Path.location);
  } 

} else if (Operation.parse(program) && Operation.isStandalone()) {
  Operation.run();
} else {
  program.help();
}