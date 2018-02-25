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
  exports.reorderCommands(activeCommands, query, nameExtractor);
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

exports.reorderCommands = (activeCommands, query, nameExtractor) => {
  query = query.toLowerCase();
  activeCommands.sort((a, b) => {
    let nameA = nameExtractor(a).toLowerCase();
    let nameB = nameExtractor(b).toLowerCase();
    if (query.length == 0) {
      return nameA.localeCompare(nameB);
    }
    let longestMatchA = longestCommonSubstring(nameA, query);
    let longestMatchB = longestCommonSubstring(nameB, query);
    if (longestMatchA.length != longestMatchB.length)
      return longestMatchB.length - longestMatchA.length;
    return -nameB.indexOf(longestMatchB) + nameA.indexOf(longestMatchA);
  });
};

const longestCommonSubstring = (strA, strB) => {
  let comparsions = [],
    maxSubStrLength = 0,
    lastMaxSubStrIndex = -1;
  for (let i = 0; i < strA.length; ++i) {
    comparsions[i] = [];
    for (let j = 0; j < strB.length; ++j) {
      if (strA.charAt(i) === strB.charAt(j)) {
        if (i > 0 && j > 0) {
          comparsions[i][j] = comparsions[i - 1][j - 1] + 1;
        } else {
          comparsions[i][j] = 1;
        }
      } else {
        comparsions[i][j] = 0;
      }
      if (comparsions[i][j] > maxSubStrLength) {
        maxSubStrLength = comparsions[i][j];
        lastMaxSubStrIndex = i;
      }
    }
  }
  return maxSubStrLength > 0
    ? strA.substr(lastMaxSubStrIndex - maxSubStrLength + 1, maxSubStrLength)
    : "";
};
