import * as fs from 'fs';

namespace ProjectArchivist {
  const MSG_BEGIN: string = "@echo off\n" +
    "echo This script was created with Project Archivist v1.0\n" +
    "echo Beginning archiving...";

  const MSG_CURRENT_PREFIX = "echo Archiving: ";

  const CMD = "7z a";
  const SPACE = " ";
  const QUOTE = "\"";
  const NEWLINE = "\n"

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

  export enum ArchiveType {
    sevenz = "7z",
    zip = "zip"
  }

  export enum CompressionMethod {
    lzma = "lzma",
    lzma2 = "lzma2",
    ppmd = "ppmd",
    bzip2 = "bzip2"
  }

  export const Defaults = {
    DefaultLevel: 0,
    DefaultType: ArchiveType.sevenz,
    DefaultMethod: CompressionMethod.lzma
  }

  /*
  ** An archived item represents the resulting file archive that 7-Zip would create.
  ** The information stored in an archived item outlines the command-line parameters for 7-Zip to use.
  */
  export class ArchivedItem {
    // Used for easily identifying the item in the UI and in configuration settings
    itemName: string;

    // The file/path being archived
    sourcePath: string;

    // The path that the archive will be exported to
    destinationPath: string;

    // The name of the tile, without extension; append to destinationPath for full file path
    fileName: string;

    // Optional password parameter
    password: string;

    // Files/folders with these defined names get excluded from the archive
    exclusions: string[];

    // In 7-Zip parameters: -xr!(exclusion) vs -x!(exclusion); defines whether exclusions are top level or recursive
    exclusionsRecursives: boolean[];

    // In 7-Zip parameters: -t(type); The file extension/archive format
    type: ArchiveType;

    // In 7-Zip parameters: -mx=; A number from 0-9
    compressionLevel: number;

    // In 7-Zip parameters: -m0=; the algorithm used for compression (simply ignored by 7-Zip if compressionLevel is 0)
    compressionMethod: CompressionMethod;

    constructor(_itemName: string = "", _source: string = "", _destination: string = "", _fileName: string = "", _pass: string = "", _excl: string[] = [], _exclRec: boolean[] = [], _type: ArchiveType = Defaults.DefaultType, _compLvl: number = Defaults.DefaultLevel, _compMethod: CompressionMethod = Defaults.DefaultMethod) {
      this.itemName = _itemName;
      this.sourcePath = _source;
      this.destinationPath = _destination;
      this.fileName = _fileName;
      this.password = _pass;
      this.exclusions = _excl;
      this.exclusionsRecursives = _exclRec;
      this.type = _type;
      this.compressionLevel = _compLvl;
      this.compressionMethod = _compMethod;
    }
  }

  /*
  ** Creates a batch script based on incoming items to the provided destination using Node.js File System module
  */
  export function writeScript(items: ArchivedItem[], destination: string) {
    let out: string = MSG_BEGIN;

    items.forEach(item => {
      out += MSG_CURRENT_PREFIX + item.itemName + NEWLINE + CMD;

      if (item.type == ProjectArchivist.ArchiveType.sevenz)
        out += PARAM_TYPE + EXTENSION_SEVENZIP + SPACE;
      else
        out += PARAM_TYPE + EXTENSION_ZIP + SPACE;

      switch (item.compressionMethod)
      {
        case ProjectArchivist.CompressionMethod.bzip2:
          out += TYPE_BZIP2 + SPACE;
        case ProjectArchivist.CompressionMethod.ppmd:
          out += TYPE_PPMD + SPACE;
        case ProjectArchivist.CompressionMethod.lzma2:
          out += TYPE_LZMA2 + SPACE;
        case ProjectArchivist.CompressionMethod.lzma:
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

      if (item.type == ProjectArchivist.ArchiveType.sevenz)
        out += "." + EXTENSION_SEVENZIP + QUOTE + SPACE;
      else
        out += "." + EXTENSION_ZIP + QUOTE + SPACE;
    });

    fs.writeFile(destination, out, function (err: any) {
      if (err) throw err;
    });
  }
}
