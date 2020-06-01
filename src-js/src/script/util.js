const fs = require('fs');

const MSG_BEGIN = "@echo off\n" +
  "echo This script was created with Project Archivist v1.0\n" +
  "echo Beginning archiving...";

const MSG_CURRENT_PREFIX = "echo Archiving: ";

const CMD = "7z a";
const SPACE = " ";
const QUOTE = "\"";
const NEWLINE = "\n";

const PARAM_LEVEL = "-mx=";
const PARAM_ENCRYPT = "-mhe";
const PARAM_PASS = "-p";
const PARAM_EXCLUDE = "-x!";
const PARAM_EXCLUDE_RECURSIVE = "-xr!";
const PARAM_TYPE = "-t";

const EXTENSION_SEVENZIP = "7z";
const EXTENSION_ZIP = "zip";

const TYPE_LZMA = "-m0=LZMA";
const TYPE_LZMA2 = "-m0=LZMA2";
const TYPE_BZIP2 = "-m0=BZip2";
const TYPE_PPMD = "-m0=PPMd";

/*
** Creates a batch script based on incoming items to the provided destination using Node.js File System module
*/
function writeScript(items, destination) {
  let out = MSG_BEGIN;

  items.forEach(item => {
    out += MSG_CURRENT_PREFIX + item.itemName + NEWLINE + CMD;

    if (item.type == ArchiveType.sevenz)
      out += PARAM_TYPE + EXTENSION_SEVENZIP + SPACE;
    else
      out += PARAM_TYPE + EXTENSION_ZIP + SPACE;

    switch (item.compressionMethod)
    {
      case CompressionMethod.bzip2:
        out += TYPE_BZIP2 + SPACE;
      case CompressionMethod.ppmd:
        out += TYPE_PPMD + SPACE;
      case CompressionMethod.lzma2:
        out += TYPE_LZMA2 + SPACE;
      case CompressionMethod.lzma:
      default:
        out += TYPE_LZMA + SPACE;
    }

    out += PARAM_LEVEL + item.compressionLevel.toString() + SPACE;

    if (item.password != "")
      out += PARAM_PASS + item.password + SPACE + PARAM_ENCRYPT + SPACE;

    for (let i = 0; i < item.exclusions.length; i++) {
      if (item.exclusionsRecursives[i])
        out += PARAM_EXCLUDE_RECURSIVE + item.exclusions[i] + SPACE;
      else
        out += PARAM_EXCLUDE + item.exclusions[i] + SPACE;
    }

    out += QUOTE + item.destinationPath + "\\" + item.fileName;

    if (item.type == ArchiveType.sevenz)
      out += "." + EXTENSION_SEVENZIP + QUOTE + SPACE;
    else
      out += "." + EXTENSION_ZIP + QUOTE + SPACE;
  });

  fs.writeFile(destination, out, function (err) {
    if (err) throw err;
  });
}
