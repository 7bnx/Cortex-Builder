"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Show = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const nStartup = require("./startup");
const nCortexBuilder = require("./Creator/CortexBuilder");
const nC_CPP_Properties = require("./Creator/C_CPP_Properties");
const nLinker = require("./Creator/Linker");
const nLaunch = require("./Creator/Launch");
const nStartupCreator = require("./Creator/Startup");
const nTasks = require("./Creator/Tasks");
const nMakefile = require("./Creator/Makefile");
const nDownload = require("./download");
const nJLink = require("./Creator/JLink");
const CortexBuilder_1 = require("./Creator/CortexBuilder");
var panel = undefined;
var controllers = [];
const onDiskCSS = vscode.Uri.file(path.join(__dirname, '..', 'resources', 'html', 'index.css'));
const onDiskJS = vscode.Uri.file(path.join(__dirname, '..', 'resources', 'html', 'index.js'));
var htmlContent = '';
var isFirstLaunch = true;
function Show() {
    const columnToShowIn = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined;
    if (panel !== undefined) {
        // If we already have a panel, show it in the target column
        panel.reveal(columnToShowIn);
    }
    else {
        // Otherwise, create a new panel
        panel = vscode.window.createWebviewPanel('cortexbuilderSettings', 'Cortex Builder Settings', vscode.ViewColumn.One, {
            localResourceRoots: [vscode.Uri.file(path.join(__dirname, '..', 'resources', 'html'))],
            enableScripts: true,
            retainContextWhenHidden: true
        });
        const cssIndex = panel.webview.asWebviewUri(onDiskCSS);
        const jsIndex = panel.webview.asWebviewUri(onDiskJS);
        htmlContent = fs.readFileSync(path.join(__dirname, '..', 'resources', 'html', 'index.html')).toString().replace('index.css', cssIndex.toString()).replace('index.js', jsIndex.toString());
        panel.webview.html = htmlContent;
        panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'setCompilerPath':
                    setCompilerPath();
                    break;
                case 'setOpenOCDPath':
                    setOpenOCDPath();
                    break;
                case 'setSettings':
                    setSettings(message);
                    break;
            }
        });
        postSettingsMessage();
        panel.onDidDispose(() => {
            panel = undefined;
        }, null, nStartup.context.subscriptions);
    }
}
exports.Show = Show;
function postSettingsMessage() {
    if (controllers.length === 0) {
        nStartup.controllersList.forEach(controller => {
            controllers.push(controller.label);
        });
    }
    let general = {
        compilerPath: nStartup.context.globalState.get('compilerPath', ''),
        openOCDPath: nStartup.context.globalState.get('openOCDPath', '')
    };
    nCortexBuilder.Get().then(settings => {
        if (panel === undefined) {
            return;
        }
        panel.webview.postMessage({ command: 'setSettings',
            data: { controllers: controllers, settings: settings, general: general } });
    });
}
function setCompilerPath() {
    let openDialogOptions = {
        canSelectFiles: true,
        canSelectMany: false,
        canSelectFolders: false,
        filters: {
            source: ['exe']
        }
    };
    vscode.window.showOpenDialog(openDialogOptions).then(files => {
        if (files !== undefined && panel !== undefined) {
            let str = files[0].fsPath;
            panel.webview.postMessage({ command: 'setCompilerPath', data: str });
        }
    });
}
function setOpenOCDPath() {
    let openDialogOptions = {
        canSelectFiles: false,
        canSelectMany: false,
        canSelectFolders: true,
    };
    vscode.window.showOpenDialog(openDialogOptions).then(folder => {
        if (folder !== undefined && panel !== undefined) {
            let str = folder[0].fsPath;
            let check = path.join(str, 'share', 'openocd', 'scripts', 'target');
            if (!fs.existsSync(check)) {
                str = '';
                vscode.window.showErrorMessage('Wrong openOCD path');
            }
            panel.webview.postMessage({ command: 'setOpenOCDPath', data: str });
        }
    });
}
function setSettings(data) {
    vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    if (CortexBuilder_1.projectSettings.controller !== data.controller) {
        nDownload.GetController(data.controller).then(controller => {
            nDownload.GetSVD(controller.svd).then(() => { });
            nDownload.GetInclude(controller.include).then(() => { });
            let newController = GetController(data.controller);
            let oldController = GetController(CortexBuilder_1.projectSettings.controller);
            if (oldController.define !== newController.define) {
                for (let i = 0; i < data.defines.length; ++i) {
                    if (data.defines[i] === oldController.define) {
                        data.defines.splice(i, 1);
                        break;
                    }
                }
            }
            let tmpDefines = data.defines;
            data.defines = [newController.define];
            tmpDefines.forEach(def => { data.defines.push(def); });
            if (oldController.include !== newController.include) {
                let incDir = path.join(nStartup.context.globalStoragePath, 'Include', oldController.include);
                let inc = path.join(incDir, oldController.include + '.h');
                for (let i = 0; i < CortexBuilder_1.projectSettings.includesDir.length; ++i) {
                    if (CortexBuilder_1.projectSettings.includesDir[i] === incDir) {
                        CortexBuilder_1.projectSettings.includesDir.splice(i, 1);
                        break;
                    }
                }
                for (let i = 0; i < CortexBuilder_1.projectSettings.includes.length; ++i) {
                    if (CortexBuilder_1.projectSettings.includes[i] === inc) {
                        CortexBuilder_1.projectSettings.includes.splice(i, 1);
                        break;
                    }
                }
                CortexBuilder_1.projectSettings.includesDir.push(path.join(nStartup.context.globalStoragePath, 'Include', newController.include));
                CortexBuilder_1.projectSettings.includes.push(path.join(nStartup.context.globalStoragePath, 'Include', newController.include, newController.include + '.h'));
            }
            CortexBuilder_1.projectSettings.core = newController.core;
            CortexBuilder_1.projectSettings.flashSizeK = newController.flashSizeK;
            CortexBuilder_1.projectSettings.flashSizeHex = newController.flashSizeHex;
            CortexBuilder_1.projectSettings.flashPageSize = newController.flashPageSize;
            CortexBuilder_1.projectSettings.ramStart = newController.ramStart;
            CortexBuilder_1.projectSettings.ramSizeK = newController.ramSizeK;
            CortexBuilder_1.projectSettings.ramSizeHex = newController.ramSizeHex;
            CortexBuilder_1.projectSettings.ramEnd = newController.ramEnd;
            CortexBuilder_1.projectSettings.startupFPU = newController.startupFPU;
            CortexBuilder_1.projectSettings.makefileFPU = newController.makefileFPU;
            CortexBuilder_1.projectSettings.makefileFLOATABI = newController.makefileFLOATABI;
            CortexBuilder_1.projectSettings.svd = newController.svd;
            CortexBuilder_1.projectSettings.jlinkTaskDevice = newController.jlinkTaskDevice;
            CortexBuilder_1.projectSettings.openocdTaskDevice = newController.openocdTaskDevice;
            CortexBuilder_1.projectSettings.deviceInc = newController.include;
            CortexBuilder_1.projectSettings.interrupts = newController.interrupts;
            nStartup.treeViewProvider.PushItems({ includes: CortexBuilder_1.projectSettings.includes, includesDir: CortexBuilder_1.projectSettings.includesDir,
                sources: CortexBuilder_1.projectSettings.sources }, controller.include);
            SetSettings1(data, true);
        });
    }
    else {
        SetSettings1(data);
    }
}
function SetSettings1(data, state = false) {
    let isCortexBuilderChanges = state;
    let isMakeFileChanges = state;
    let isStartupChanges = state;
    let isLinkerChanges = state;
    let isLaunchChanges = state;
    let isSettingsChanges = state;
    let isC_CPP_PropertiesChanges = state;
    let isTasksChanges = state;
    let isOpenOCDConfigChanges = state;
    if (CortexBuilder_1.projectSettings.flashStart !== data.flashStart ||
        CortexBuilder_1.projectSettings.stackSize !== data.stackSize ||
        CortexBuilder_1.projectSettings.heapSize !== data.heapSize) {
        isCortexBuilderChanges = true;
        isLinkerChanges = true;
    }
    if (CortexBuilder_1.projectSettings.standardC !== data.standardC ||
        CortexBuilder_1.projectSettings.standardCPP !== data.standardCPP ||
        CortexBuilder_1.projectSettings.optimization !== data.optimization) {
        if (CortexBuilder_1.projectSettings.standardC !== data.standardC) {
            nStartup.context.globalState.update('cStandard', data.standardC);
        }
        if (CortexBuilder_1.projectSettings.standardCPP !== data.standardCPP) {
            nStartup.context.globalState.update('cppStandard', data.standardCPP);
        }
        if (CortexBuilder_1.projectSettings.optimization !== data.optimization) {
            nStartup.context.globalState.update('optimization', data.optimization);
        }
        isCortexBuilderChanges = true;
        isC_CPP_PropertiesChanges = true;
        isMakeFileChanges = true;
    }
    if (!IsArraysMatch(CortexBuilder_1.projectSettings.flagsASM, data.flagsASM) ||
        !IsArraysMatch(CortexBuilder_1.projectSettings.flagsC, data.flagsC) ||
        !IsArraysMatch(CortexBuilder_1.projectSettings.flagsCPP, data.flagsCPP)) {
        isCortexBuilderChanges = true;
        isMakeFileChanges = true;
    }
    let compilerPath = data.compilerPath;
    if (compilerPath !== nStartup.context.globalState.get('compilerPath')) {
        nStartup.context.globalState.update('compilerPath', data.compilerPath);
        isC_CPP_PropertiesChanges = true;
    }
    let openOCDPath = data.openOCDPath;
    if (openOCDPath !== nStartup.context.globalState.get('openOCDPath')) {
        nStartup.context.globalState.update('openOCDPath', data.openOCDPath);
        isCortexBuilderChanges = true;
        isLinkerChanges = true;
        isOpenOCDConfigChanges = true;
    }
    if (data.servertype !== CortexBuilder_1.projectSettings.servertype) {
        nStartup.context.globalState.update('servertype', data.servertype);
        isCortexBuilderChanges = true;
        isLaunchChanges = true;
    }
    if (data.servertype === 'jlink') {
        data.debugger = 'jlink';
    }
    if (data.servertype === 'openocd' || (data.debugger !== CortexBuilder_1.projectSettings.debugger && data.servertype === 'openocd')) {
        nStartup.context.globalState.update('debugger', data.debugger);
        isCortexBuilderChanges = true;
        let configFiles = nLaunch.GetOpenOCDConfigFiles();
        if (configFiles.length === 0 || (configFiles.length === 2 &&
            configFiles[0] === nCortexBuilder.projectSettings.openocdTransportPath &&
            configFiles[1] === nCortexBuilder.projectSettings.openocdDevicePath)) {
            isLaunchChanges = true;
            isOpenOCDConfigChanges = true;
            isTasksChanges = true;
        }
    }
    if (data.projectType !== CortexBuilder_1.projectSettings.projectType) {
        nStartup.context.globalState.update('projectType', data.projectType);
        isMakeFileChanges = true;
        isCortexBuilderChanges = true;
    }
    if (!IsArraysMatch(CortexBuilder_1.projectSettings.defines, data.defines)) {
        isMakeFileChanges = true;
        isC_CPP_PropertiesChanges = true;
        isCortexBuilderChanges = true;
    }
    CortexBuilder_1.projectSettings.controller = data.controller;
    CortexBuilder_1.projectSettings.flashStart = data.flashStart;
    CortexBuilder_1.projectSettings.stackSize = data.stackSize;
    CortexBuilder_1.projectSettings.heapSize = data.heapSize;
    CortexBuilder_1.projectSettings.standardC = data.standardC;
    CortexBuilder_1.projectSettings.standardCPP = data.standardCPP;
    CortexBuilder_1.projectSettings.optimization = data.optimization;
    CortexBuilder_1.projectSettings.projectType = data.projectType;
    CortexBuilder_1.projectSettings.defines = data.defines;
    CortexBuilder_1.projectSettings.flagsASM = data.flagsASM;
    CortexBuilder_1.projectSettings.flagsC = data.flagsC;
    CortexBuilder_1.projectSettings.flagsCPP = data.flagsCPP;
    CortexBuilder_1.projectSettings.servertype = data.servertype;
    CortexBuilder_1.projectSettings.debugger = data.debugger;
    if (isCortexBuilderChanges) {
        nCortexBuilder.Replace(isOpenOCDConfigChanges);
    }
    if (isLaunchChanges) {
        nLaunch.Replace("swd", isOpenOCDConfigChanges).then(() => {
            if (isTasksChanges) {
                nTasks.Replace(CortexBuilder_1.projectSettings.core, CortexBuilder_1.projectSettings.jlinkTaskDevice);
            }
        });
    }
    if (isC_CPP_PropertiesChanges) {
        nC_CPP_Properties.Replace(compilerPath);
    }
    if (isLinkerChanges) {
        nLinker.Replace(CortexBuilder_1.projectSettings.ramStart, CortexBuilder_1.projectSettings.flashStart, CortexBuilder_1.projectSettings.ramEnd, CortexBuilder_1.projectSettings.ramSizeK, CortexBuilder_1.projectSettings.flashSizeK, CortexBuilder_1.projectSettings.heapSize, CortexBuilder_1.projectSettings.stackSize);
    }
    if (isStartupChanges) {
        nStartupCreator.Replace(CortexBuilder_1.projectSettings.core, CortexBuilder_1.projectSettings.startupFPU, CortexBuilder_1.projectSettings.interrupts);
    }
    if (isMakeFileChanges) {
        nMakefile.Replace(CortexBuilder_1.projectSettings.projectType, CortexBuilder_1.projectSettings.core, CortexBuilder_1.projectSettings.flashStart, CortexBuilder_1.projectSettings.makefileFPU, CortexBuilder_1.projectSettings.makefileFLOATABI, CortexBuilder_1.projectSettings.standardC, CortexBuilder_1.projectSettings.standardCPP, CortexBuilder_1.projectSettings.optimization, CortexBuilder_1.projectSettings.defines, CortexBuilder_1.projectSettings.includesDir, CortexBuilder_1.projectSettings.sources, CortexBuilder_1.projectSettings.flagsASM, CortexBuilder_1.projectSettings.flagsC, CortexBuilder_1.projectSettings.flagsCPP);
    }
    if (data.debugger === 'jlink') {
        nJLink.New();
    }
    else {
        nJLink.Delete();
    }
}
function GetController(controllerName) {
    let controllerPath = path.join(nStartup.context.globalStoragePath, 'Controllers', controllerName, controllerName + '.json');
    let data = fs.readFileSync(controllerPath);
    return JSON.parse(data.toString());
}
function IsArraysMatch(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; ++i) {
        let isMatch = false;
        for (let j = 0; j < arr2.length; ++j) {
            if (arr1[i] === arr2[j]) {
                isMatch = true;
                break;
            }
        }
        if (!isMatch) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=webView.js.map