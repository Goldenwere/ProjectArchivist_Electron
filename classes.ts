namespace ProjectArchivist {
  export enum ArchiveType {
    sevenz = "7z",
    zip = "zip"
  }

  export enum CompressionMethod {
    lzma = "LZMA",
    lzma2 = "LZMA2",
    ppmd = "PPMd",
    bzip2 = "BZip2"
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
    exclusionsRecursives: string[];

    // In 7-Zip parameters: -t(type); The file extension/archive format
    type: ArchiveType;

    // In 7-Zip parameters: -mx=; A number from 0-9
    compressionLevel: number;

    // In 7-Zip parameters: -m0=; the algorithm used for compression (simply ignored by 7-Zip if compressionLevel is 0)
    compressionMethod: CompressionMethod;

    constructor(_itemName: string, _sourcePath: string, _destinationPath: string, _fileName: string, _password: string, _exclusions: string[], _exclusionsRecursives: string[], _type: ArchiveType, _compressionLevel: number, _compressionMethod: CompressionMethod) {
      this.itemName = _itemName;
      this.sourcePath = _sourcePath;
      this.destinationPath = _destinationPath;
      this.fileName = _fileName;
      this.password = _password;
      this.exclusions = _exclusions;
      this.exclusionsRecursives = _exclusionsRecursives;
      this.type = _type;
      this.compressionLevel = _compressionLevel;
      this.compressionMethod = _compressionMethod;
    }
  }
}
