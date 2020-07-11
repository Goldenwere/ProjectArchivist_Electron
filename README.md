# Project Archivist

## About

Project Archivist is an Electron application used for creating batch script files that execute [7-Zip add commands](https://sevenzip.osdn.jp/chm/cmdline/commands/add.htm) to create archives primarily for file backup purposes.

## Origin

Project Archivist stems from the code written for a [Windows Form application of the same name](https://github.com/xLightling/ProjectArchivist_WinForms) that was created in under 24 hours. See [its origin](https://github.com/xLightling/ProjectArchivist_WinForms#origin) for more details.

## Roadmap

### Up next for 1.1.0

- Script interpreter (load script for editing)
- Open shell from app
  - Ensure 7-Zip installed using [command-exists](https://github.com/raftario/command-exists)
  - Automatic script execution within program using [child_process](https://stackoverflow.com/questions/35079548/how-to-call-shell-script-or-python-script-in-from-a-atom-electron-app)
- (TBD) End-of-script summary
- (TBD) Autocomplete (interpret name/file name from source)

### Up next for 1.2.0

- Themes
- (TBD) UI Navigation (arrow keys)

### Needs Researching

- Linux implementation
- Mac implementation (will need Mac tester)
