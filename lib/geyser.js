#! /usr/bin/env node

var program = require("commander");
var exec = require("child_process").exec;

program
  .version("0.0.1")
  .option("-i, install", "Install described modules globally.")
  .option("-p, --path [config file]", "Use a custom config file path.")
  .parse(process.argv);

function determinePath(path) {
  return (process.cwd() + "/" + path);
}

var Operation = {
  parse: function (program) {
    var operation = null;
    if (program.install) operation = this.opTypes.install;
    this.opType = operation;
    return operation;
  },
  runOnPackages: function (packages) {
    var $this = this

    Object.keys(packages).forEach(function (pkg) {
      var callback = function (err, stdout, stderr) {
        if (err) throw err;
        if (stdout) console.log(stdout);
        if (stderr) console.log(stderr);
      };

      var command = "";

      switch ($this.opType) {
        case ($this.opTypes.install):
          command = ("npm install -g " + pkg + "@" + packages[pkg])
          break;

        default:
          break;
      }

      console.log("Running command: " + command + " ...");
      var child = exec(command, callback);
    })
  },
  opType: 0,
  opTypes: {install: 1}
}

// Treat operation types as an enum.
Object.freeze(Operation.opTypes)

if (Operation.parse(program)) {
  var path = (program.path && program.path.length > 0) ? program.path : "geyser.json";
  path = determinePath(path);
  console.log("Using path: %s", path);

  var config = null;

  try {
    config = require(path);
  } catch (err) {
    throw ("Configuration file not found at specified path: %s", path);
  }

  if (config && config.globalDependencies) {
    Operation.runOnPackages(config.globalDependencies)
  } else {
    console.log("Couldn't find globalDependencies in configuration file.");
  } 

} else {
  program.help();
}