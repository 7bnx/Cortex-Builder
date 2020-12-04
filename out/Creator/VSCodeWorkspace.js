"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeDefines = exports.New = void 0;
const fs = require("fs");
const vscode = require("vscode");
const path = require("path");
//const fileName:string =
//(vscode.workspace.rootPath === undefined)? "":
// (vscode.workspace.rootPath.split(path.sep))[vscode.workspace.rootPath.split(path.sep).length - 1] + ".code-workspace";
const filePath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';
const fileName = filePath.split(path.sep)[0] + ".code-workspace";
const fullPath = path.join(filePath, fileName);
function New(projectPath = filePath, controller) {
    return new Promise((resolve, reject) => {
        let projectName = (projectPath.split(path.sep))[projectPath.split(path.sep).length - 1];
        let folders = [{ path: '.' }];
        let jsonData = { folders: folders };
        let jsonObject = JSON.stringify(jsonData, null, "\t");
        if (!fs.existsSync(projectPath)) {
            fs.mkdirSync(projectPath, { recursive: true });
        }
        fs.writeFile(path.join(projectPath, projectName + ".code-workspace"), jsonObject, () => {
            return resolve();
        });
    });
}
exports.New = New;
function ChangeDefines(defines) {
    Get().then(workspace => {
        let jsonObject = JSON.stringify(workspace, null, "\t");
        fs.writeFile(fullPath, jsonObject, () => { });
    });
}
exports.ChangeDefines = ChangeDefines;
function Get() {
    return new Promise((resolve, reject) => {
        fs.readFile(fullPath, (err, data) => {
            if (data !== undefined) {
                let properties = JSON.parse(data.toString());
                resolve(properties);
            }
        });
    });
}
//# sourceMappingURL=VSCodeWorkspace.js.map