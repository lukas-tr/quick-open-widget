import React from "react";
exports.filterList = (
  activeCommands,
  inactiveCommands,
  query,
  queryGotLonger,
  nameExtractor
) => {
  if (!queryGotLonger) {
    //query got shorter
    let index = inactiveCommands.length - 1;
    while (index >= 0) {
      let command = inactiveCommands[index];
      let queryIdx = 0;
      for (let char of nameExtractor(command)) {
        if (char.toLowerCase() == query.charAt(queryIdx).toLowerCase()) {
          queryIdx++;
        }
      }
      if (queryIdx == query.length) {
        //everything matched
        activeCommands.push(command);
        inactiveCommands.splice(index, 1);
      }
      index -= 1;
    }
  } else {
    //query got longer
    let index = activeCommands.length - 1;
    while (index >= 0) {
      let command = activeCommands[index];
      let queryIdx = 0;
      for (let char of nameExtractor(command)) {
        if (char.toLowerCase() == query.charAt(queryIdx).toLowerCase()) {
          queryIdx++;
        }
      }
      if (queryIdx != query.length) {
        // didn't match
        inactiveCommands.push(command);
        activeCommands.splice(index, 1);
      }
      index -= 1;
    }
  }
};

exports.formatQueryText = (query, text, highlightedClassName) => {
  // not case sensitive
  let queryIdx = 0;
  let output = [];
  query = query.toLowerCase();
  for (let char of text) {
    if (char.toLowerCase() == query.charAt(queryIdx)) {
      output.push(
        <span key={queryIdx} className={highlightedClassName}>
          {char}
        </span>
      );
      queryIdx++;
    } else {
      output.push(char);
    }
  }
  return output;
};
