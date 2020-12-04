"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.New = void 0;
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const fileName = "settings.json";
const fileDir = ".vscode";
const filePath = path.join(vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '', fileDir);
function New(projectPath = filePath, controller) {
    if (projectPath !== filePath) {
        projectPath = path.join(projectPath, fileDir);
    }
    let jsonData = {
        "files.exclude": {
            "**/.vscode": false,
            "**/JLink": true,
            "**/.git*": true,
            "**/*.code-workspace": false,
            "**/cortexbuilder.json": true
        }
    };
    let jsonObject = JSON.stringify(jsonData, null, "\t");
    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
    }
    fs.writeFileSync(path.join(projectPath, fileName), jsonObject);
}
exports.New = New;
//# sourceMappingURL=Settings.js.map