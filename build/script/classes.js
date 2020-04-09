"use strict";
var ProjectArchivist;
(function (ProjectArchivist) {
    let ArchiveType;
    (function (ArchiveType) {
        ArchiveType["sevenz"] = "7z";
        ArchiveType["zip"] = "zip";
    })(ArchiveType = ProjectArchivist.ArchiveType || (ProjectArchivist.ArchiveType = {}));
    let CompressionMethod;
    (function (CompressionMethod) {
        CompressionMethod["lzma"] = "LZMA";
        CompressionMethod["lzma2"] = "LZMA2";
        CompressionMethod["ppmd"] = "PPMd";
        CompressionMethod["bzip2"] = "BZip2";
    })(CompressionMethod = ProjectArchivist.CompressionMethod || (ProjectArchivist.CompressionMethod = {}));
    ProjectArchivist.Defaults = {
        DefaultLevel: 0,
        DefaultType: ArchiveType.sevenz,
        DefaultMethod: CompressionMethod.lzma
    };
    /*
    ** An archived item represents the resulting file archive that 7-Zip would create.
    ** The information stored in an archived item outlines the command-line parameters for 7-Zip to use.
    */
    class ArchivedItem {
        constructor(_itemName, _sourcePath, _destinationPath, _fileName, _password, _exclusions, _exclusionsRecursives, _type, _compressionLevel, _compressionMethod) {
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
    ProjectArchivist.ArchivedItem = ArchivedItem;
})(ProjectArchivist || (ProjectArchivist = {}));
//# sourceMappingURL=classes.js.map