"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeStandard = exports.ChangeCPPStandard = exports.ChangeCStandard = exports.ChangeCompilerPath = exports.UpdateDefines = exports.UpdateIncludesDir = exports.Replace = exports.New = void 0;
const fs = require("fs");
const vscode = require("vscode");
const path = require("path");
const startup_1 = require("../startup");
const CortexBuilder_1 = require("./CortexBuilder");
const fileName = "c_cpp_properties.json";
const fileDir = ".vscode";
const filePath = path.join(vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '', fileDir);
const fullPath = path.join(filePath, fileName);
function New(projectPath = filePath, include, defines) {
    let includesDir = [path.join(startup_1.context.globalStoragePath, 'Core'),
        path.join(startup_1.context.globalStoragePath, 'Include', include),
        path.join(projectPath, 'user')];
    if (projectPath !== filePath) {
        projectPath = path.join(projectPath, fileDir);
    }
    let compilerPath = startup_1.context.globalState.get('compilerPath', '');
    let cStandard = startup_1.context.globalState.get('cStandard', 'c11');
    let cppStandard = startup_1.context.globalState.get('cppStandard', 'c++17');
    let configuration = {
        name: "Cortex-Builder",
        compilerPath: compilerPath,
        defines: defines,
        includePath: includesDir,
        cStandard: cStandard,
        cppStandard: cppStandard,
        intelliSenseMode: "${default}"
    };
    let jsonData = { configurations: [configuration], version: 4 };
    let jsonObject = JSON.stringify(jsonData, null, "\t");
    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
    }
    fs.writeFile(path.join(projectPath, fileName), jsonObject, () => { });
}
exports.New = New;
function Replace(compilerPath) {
    Get().then(properties => {
        properties.configurations[0].includePath = CortexBuilder_1.projectSettings.includesDir;
        properties.configurations[0].defines = CortexBuilder_1.projectSettings.defines;
        properties.configurations[0].cStandard = CortexBuilder_1.projectSettings.standardC;
        properties.configurations[0].cppStandard = CortexBuilder_1.projectSettings.standardCPP;
        properties.configurations[0].compilerPath = compilerPath;
        Write(properties);
    });
}
exports.Replace = Replace;
function UpdateIncludesDir(includes) {
    Get().then(properties => {
        properties.configurations[0].includePath = includes;
        Write(properties);
    });
}
exports.UpdateIncludesDir = UpdateIncludesDir;
function UpdateDefines(defines) {
    Get().then(properties => {
        properties.configurations[0].defines = defines;
        Write(properties);
    });
}
exports.UpdateDefines = UpdateDefines;
function ChangeCompilerPath(newCompilerPath) {
    Get().then(properties => {
        if (properties.configurations[0].compilerPath !== newCompilerPath) {
            properties.configurations[0].compilerPath = newCompilerPath;
            Write(properties);
        }
    });
}
exports.ChangeCompilerPath = ChangeCompilerPath;
function ChangeCStandard(newCStandard) {
    ChangeStandard(newCStandard, true);
}
exports.ChangeCStandard = ChangeCStandard;
function ChangeCPPStandard(newCStandard) {
    if (newCStandard === "gnu++2a") {
        newCStandard = "gnu++20";
    }
    else if (newCStandard === "c++2a") {
        newCStandard = "c++20";
    }
    ChangeStandard(newCStandard, false);
}
exports.ChangeCPPStandard = ChangeCPPStandard;
function ChangeStandard(newStandard, isCChange) {
    Get().then(properties => {
        if (isCChange) {
            properties.configurations[0].cStandard = newStandard;
        }
        else {
            properties.configurations[0].cppStandard = newStandard;
        }
        ;
        Write(properties);
    });
}
exports.ChangeStandard = ChangeStandard;
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
function Write(jsonData) {
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
    }
    let jsonObject = JSON.stringify(jsonData, null, "\t");
    fs.writeFile(fullPath, jsonObject, () => { });
}
//# sourceMappingURL=C_CPP_Properties.js.map