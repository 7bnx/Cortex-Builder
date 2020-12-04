"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delete = exports.New = void 0;
const fs = require("fs");
const vscode = require("vscode");
const path = require("path");
const ext = ".jlink";
const filePath = path.join(vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '', 'Jlink');
function New(projectName = '', projectPath = '') {
    if (projectName === '' || projectPath === '') {
        projectPath = filePath;
        projectName = (projectPath.split(path.sep))[projectPath.split(path.sep).length - 2];
    }
    else {
        projectPath = path.join(projectPath, 'JLink');
    }
    if (fs.existsSync(projectPath)) {
        return;
    }
    const resetCommand = 'r\ng\nq';
    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
    }
    fs.writeFile(path.join(projectPath, 'Reset' + ext), resetCommand, () => { });
    const eraseCommand = 'erase\n' + resetCommand;
    fs.writeFile(path.join(projectPath, 'Erase' + ext), eraseCommand, () => { });
    let flashCommand = `r\nloadbin output/${projectName}.bin, 0x00\nverifybin output/${projectName}.bin, 0x00\n` + resetCommand;
    fs.writeFile(path.join(projectPath, 'Flash' + ext), flashCommand, () => { });
    let readCommand = 'savebin Read.bin, 0x00, 0x4000\n' + resetCommand;
    fs.writeFile(path.join(projectPath, 'Read' + ext), readCommand, () => { });
}
exports.New = New;
function Delete() {
    rimraf(filePath);
}
exports.Delete = Delete;
function rimraf(dir_path) {
    if (fs.existsSync(dir_path)) {
        fs.readdirSync(dir_path).forEach(function (entry) {
            var entry_path = path.join(dir_path, entry);
            if (fs.lstatSync(entry_path).isDirectory()) {
                rimraf(entry_path);
            }
            else {
                fs.unlinkSync(entry_path);
            }
        });
        fs.rmdirSync(dir_path);
    }
}
//# sourceMappingURL=JLink.js.map