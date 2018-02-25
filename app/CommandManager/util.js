const { lstatSync, readdirSync } = require("fs");
const { join, dirname } = require("path");

const isDirectory = source => lstatSync(source).isDirectory();
const getDirectories = source =>
  readdirSync(source)
    .map(name => join(source, name))
    .filter(isDirectory);
module.exports = {
  isDirectory,
  getDirectories
};
