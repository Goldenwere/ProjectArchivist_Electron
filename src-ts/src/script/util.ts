import * as fs from 'fs';
import { ArchivedItem, ArchiveType, CompressionMethod } from './classes';

const MSG_BEGIN: string = "@echo off\n" +
  "echo This script was created with Project Archivist v1.0\n" +
  "echo Beginning archiving...";

const MSG_CURRENT_PREFIX: string = "echo Archiving: ";

const CMD: string = "7z a";
const SPACE: string = " ";
const QUOTE: string = "\"";
const NEWLINE: string = "\n";

const PARAM_LEVEL: string = "-mx=";
const PARAM_ENCRYPT: string = "-mhe";
const PARAM_PASS: string = "-p";
const PARAM_EXCLUDE: string = "-x!";
const PARAM_EXCLUDE_RECURSIVE: string = "-xr!";
const PARAM_TYPE: string = "-t";

const EXTENSION_SEVENZIP: string = "7z";
const EXTENSION_ZIP: string = "zip";

const TYPE_LZMA: string = "-m0=LZMA";
const TYPE_LZMA2: string = "-m0=LZMA2";
const TYPE_BZIP2: string = "-m0=BZip2";
const TYPE_PPMD: string = "-m0=PPMd";

/*
** Creates a batch script based on incoming items to the provided destination using Node.js File System module
*/
export function writeScript(items: ArchivedItem[], destination: string) {
  let out: string = MSG_BEGIN;

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

    for (let i: number = 0; i < item.exclusions.length; i++) {
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

  fs.writeFile(destination, out, function (err: any) {
    if (err) throw err;
  });
}
