const { lstatSync, readdirSync } = require("fs");
const { join, dirname } = require("path");

const isDirectory = source => lstatSync(source).isDirectory();
const getDirectories = source =>
  readdirSync(source)
    .map(name => join(source, name))
    .filter(isDirectory);
const getFiles = source => readdirSync(source).map(name => join(source, name));
module.exports = {
  isDirectory,
  getDirectories,
  getFiles
};
