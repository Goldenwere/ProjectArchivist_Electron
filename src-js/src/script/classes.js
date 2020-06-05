const ArchiveType = {
  sevenz: "7z",
  zip: "zip"
}

const CompressionMethod = {
  lzma: "lzma",
  lzma2: "lzma2",
  ppmd: "ppmd",
  bzip2: "bzip2"
}

const Defaults = {
  DefaultLevel: 0,
  DefaultType: ArchiveType.sevenz,
  DefaultMethod: CompressionMethod.lzma
}

class ArchivedItem {
  constructor(_itemName = "", _source = "", _destination = "", _fileName = "", _pass = "", _excl = [], _exclRec = [], _type = Defaults.DefaultType, _compLvl = Defaults.DefaultLevel, _compMethod = Defaults.DefaultMethod) {
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
