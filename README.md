# Geyser

Manage global nodejs modules from JSON config.

## What?
Thin wrapper around npm; goal: run useful operations on global dependencies.
  * Supports installation of versioned, global packages.
  * JSON format allows dramaless embedding into other config files if desired.

Config file standalone.

    /* geyser.json
    {
      "globalDependencies": {
        "bower": "latest",
        "grunt": "0.4.2",
        "coffee-script": "*"
      }
    }*/
    
    geyser install
    
Config embedded in an another file.    
    
    geyser install -p ./package.json

## Why?
  * Quickly get another dev environment up to speed with the same packages  .
  * Npm doesn't allow specifying global dependencies in package.json.

## Drawbacks
  * Hacky workaround
  * Doesn't support all expected basic features
  * Very capable of borking global packages if used incorrectly