#! /usr/bin/env node

var exec = require("child_process").exec;
var clc = require("cli-color");
var program = require("commander");

var info = clc.blue;
var warn = clc.yellow;
var error = clc.red.bold;

program
  .version("0.0.1")
  .option("install", "install described packages globally.")
  .option("installs [package]", "install described package globally.")
  .option("using [config file]", "use a custom config file path.")
  .parse(process.argv);

var Operation = {
  parse: function (program) {
    var operation = null;
    if (program.install) {
      operation = this.opTypes.installMulti;
    } else if (program.installs && program.installs.length > 0) { 
      operation = this.opTypes.installSingle;
    }
    this.opType = operation;
    return operation;
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
          command = ("npm install -g " + pkg + "@" + $this.pkgs[pkg])
          break;

        default:
          break;
      }

      console.log(info("Running command: %s ..."), command);
      var child = exec(command, onCommandDone);
    })
  },
  opType: 0,
  opTypes: {installMulti: 1, installSingle: 2},
  pkgs: [],
  pkgsKey: ""
}

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

// Treat operation and path types as enums.
Object.freeze(Operation.opTypes)
Object.freeze(Path.pathTypes)

if (Operation.parse(program)) {
  Path.determine(Path.retrieveFromCaller(program));

  // Do operations on dependencies as listed in config file.
  var dependenciesKey = null
  switch (Path.pathType) {
    case (Path.pathTypes.userDefined): 
      dependenciesKey = "globalDependencies"
      console.log(info("Using custom path: %s ..."), Path.location);
      break;
    default:
      dependenciesKey = "dependencies"
      console.log(info("Using default path: %s ..."), Path.location);
  }

  var config = null;
  try {
    config = require(Path.location);
  } catch (err) {
    console.log(error("Configuration file not found at specified path: %s!"), Path.location);
  }

  if (config && config[dependenciesKey]) {
    Operation.pkgsKey = dependenciesKey
    switch (Operation.opType) {
      case Operation.opTypes.installSingle:
        Operation.pkgs = config[Operation.pkgsKey][program.installs]
      default:
        Operation.pkgs = config[Operation.pkgsKey]
    }

    Operation.runOnPackages()
  } else {
    console.log(error("Couldn't find " + dependenciesKey + " in configuration file: %s!"), Path.location);
  } 

} else {
  program.help();
}