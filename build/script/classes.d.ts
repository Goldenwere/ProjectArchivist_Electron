declare namespace ProjectArchivist {
    enum ArchiveType {
        sevenz = "7z",
        zip = "zip"
    }
    enum CompressionMethod {
        lzma = "LZMA",
        lzma2 = "LZMA2",
        ppmd = "PPMd",
        bzip2 = "BZip2"
    }
    const Defaults: {
        DefaultLevel: number;
        DefaultType: ArchiveType;
        DefaultMethod: CompressionMethod;
    };
    class ArchivedItem {
        itemName: string;
        sourcePath: string;
        destinationPath: string;
        fileName: string;
        password: string;
        exclusions: string[];
        exclusionsRecursives: string[];
        type: ArchiveType;
        compressionLevel: number;
        compressionMethod: CompressionMethod;
        constructor(_itemName: string, _sourcePath: string, _destinationPath: string, _fileName: string, _password: string, _exclusions: string[], _exclusionsRecursives: string[], _type: ArchiveType, _compressionLevel: number, _compressionMethod: CompressionMethod);
    }
}
