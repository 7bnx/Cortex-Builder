"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOpenOCDConfigFiles = exports.GetSync = exports.Get = exports.Replace = exports.New = void 0;
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const startup_1 = require("../startup");
const CortexBuilder_1 = require("./CortexBuilder");
const fileName = "launch.json";
const fileDir = ".vscode";
const filePath = path.join(vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '', fileDir);
const fullPath = path.join(filePath, fileName);
function New(projectPath = filePath, controller) {
    let projectName = (projectPath.split(path.sep))[projectPath.split(path.sep).length - 1];
    if (projectPath !== filePath) {
        projectPath = path.join(projectPath, fileDir);
    }
    let svdFile = path.join(startup_1.context.globalStoragePath, 'SVD', controller.svd, controller.svd + '.svd');
    let _interface = "swd";
    let configuration = {
        name: "ARM-Debug",
        cwd: "${workspaceRoot}",
        executable: path.join("${workspaceRoot}", "output", projectName + ".elf"),
        svdFile: svdFile,
        request: "launch",
        type: "cortex-debug",
        servertype: CortexBuilder_1.projectSettings.servertype,
        device: controller.core,
        interface: _interface,
        runToMain: true,
        configFiles: [CortexBuilder_1.projectSettings.openocdTransportPath, CortexBuilder_1.projectSettings.openocdDevicePath]
    };
    let jsonData = { configurations: [configuration], version: "0.2.0" };
    let jsonObject = JSON.stringify(jsonData, null, "\t");
    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
    }
    fs.writeFile(path.join(projectPath, fileName), jsonObject, () => { });
}
exports.New = New;
function Replace(_interface, isOpenOCDConfigChanges = false) {
    return new Promise((resolve, reject) => {
        Get().then(launch => {
            launch.configurations[0].device = CortexBuilder_1.projectSettings.core;
            launch.configurations[0].svdFile = path.join(startup_1.context.globalStoragePath, 'SVD', CortexBuilder_1.projectSettings.svd, CortexBuilder_1.projectSettings.svd + '.svd');
            launch.configurations[0].servertype = CortexBuilder_1.projectSettings.servertype;
            launch.configurations[0].interface = _interface;
            if (isOpenOCDConfigChanges) {
                launch.configurations[0].configFiles = [CortexBuilder_1.projectSettings.openocdTransportPath, CortexBuilder_1.projectSettings.openocdDevicePath];
            }
            let jsonObject = JSON.stringify(launch, null, "\t");
            fs.writeFile(fullPath, jsonObject, () => { resolve(); });
        });
    });
}
exports.Replace = Replace;
function Get() {
    return new Promise((resolve, reject) => {
        fs.readFile(fullPath, (err, data) => {
            if (data !== undefined) {
                ;
                let properties = JSON.parse(data.toString());
                resolve(properties);
            }
        });
    });
}
exports.Get = Get;
function GetSync() {
    let data = fs.readFileSync(fullPath);
    let properties;
    properties = JSON.parse(data.toString());
    return properties;
}
exports.GetSync = GetSync;
function GetOpenOCDConfigFiles() {
    if (fs.existsSync(fullPath)) {
        let launch = JSON.parse(fs.readFileSync(fullPath).toString());
        return launch.configurations[0].configFiles;
    }
    else {
        return [CortexBuilder_1.projectSettings.openocdTransportPath, CortexBuilder_1.projectSettings.openocdDevicePath];
    }
}
exports.GetOpenOCDConfigFiles = GetOpenOCDConfigFiles;
//# sourceMappingURL=Launch.js.map