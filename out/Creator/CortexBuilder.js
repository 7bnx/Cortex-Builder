"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrepareDocumentation = exports.GetDocumentationPosition = exports.Write = exports.Get = exports.UpdateDefines = exports.UpdateSources = exports.UpdateIncludesDir = exports.UpdateIncludes = exports.ChangeOptimization = exports.ChangeStandardCPP = exports.ChangeStandardC = exports.ChangeCPPFlags = exports.ChangeCFlags = exports.ChangeAsmFlags = exports.ChangeHeapSize = exports.ChangeStackSize = exports.ChangeFlashStart = exports.Replace = exports.New = exports.projectSettings = void 0;
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const startup_1 = require("../startup");
const fileName = "cortexbuilder.json";
const fileDir = ".vscode";
const filePath = path.join(vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '', fileDir);
const fullPath = path.join(filePath, fileName);
function New(projectPath = filePath, controller) {
    let projectName = (projectPath.split(path.sep))[projectPath.split(path.sep).length - 1];
    let includesDir = [path.join(startup_1.context.globalStoragePath, 'Core'),
        path.join(startup_1.context.globalStoragePath, 'Include', controller.include),
        path.join(projectPath, 'user')];
    if (projectPath !== filePath) {
        projectPath = path.join(projectPath, fileDir);
    }
    let projectType = startup_1.context.globalState.get('projectType', 'C');
    let cStandard = startup_1.context.globalState.get('cStandard', 'c11');
    let cppStandard = startup_1.context.globalState.get('cppStandard', 'c++17');
    let optimization = startup_1.context.globalState.get('optimization', '-O1');
    let debugger_ = startup_1.context.globalState.get('debugger', 'jlink');
    let servertype = startup_1.context.globalState.get('servertype', 'jlink');
    let openocdTransport = '';
    let openocdDevice = '';
    if (servertype === 'openocd') {
        let rootPath = startup_1.context.globalState.get('openOCDPath', '');
        if (rootPath !== '') {
            //rootPath = path.join(rootPath, 'share', 'openocd', 'scripts');
            openocdTransport = path.join(rootPath, 'interface', debugger_ + '.cfg');
            openocdDevice = path.join(rootPath, 'target', controller.openocdTaskDevice + '.cfg');
            if (!fs.existsSync(openocdTransport)) {
                vscode.window.showErrorMessage("Can't find " + openocdTransport + ". Check OpenOCD Path");
            }
            if (!fs.existsSync(openocdTransport)) {
                vscode.window.showErrorMessage("Can't find " + openocdDevice + ". Check OpenOCD Path");
            }
        }
    }
    let documentation = PrepareDocumentation(controller.documentation);
    let documentationPage = new Array(documentation.length).fill(1);
    let documentationScale = new Array(documentation.length).fill('page-width');
    exports.projectSettings = {
        projectName: projectName,
        isFirstLaunch: true,
        controller: controller.name,
        core: controller.core,
        flashStart: controller.flashStart,
        flashSizeK: controller.flashSizeK,
        flashSizeHex: controller.flashSizeHex,
        flashPageSize: controller.flashPageSize,
        ramStart: controller.ramStart,
        ramSizeK: controller.ramSizeK,
        ramSizeHex: controller.ramSizeHex,
        ramEnd: controller.ramEnd,
        stackSize: controller.stackSize,
        heapSize: controller.heapSize,
        startupFPU: controller.startupFPU,
        makefileFPU: controller.makefileFPU,
        makefileFLOATABI: controller.makefileFLOATABI,
        standardC: cStandard,
        standardCPP: cppStandard,
        optimization: optimization,
        projectType: projectType,
        sources: [],
        svd: controller.svd,
        jlinkTaskDevice: controller.jlinkTaskDevice,
        openocdTaskDevice: controller.openocdTaskDevice,
        openocdDevicePath: openocdDevice,
        openocdTransportPath: openocdTransport,
        servertype: servertype,
        debugger: debugger_,
        deviceInc: controller.include,
        includesDir: includesDir,
        includes: [],
        defines: [controller.define],
        flagsASM: ["-Wall", "-fdata-sections", "-ffunction-sections"],
        flagsC: ["-Wall", "-fdata-sections", "-ffunction-sections", "-ggdb"],
        flagsCPP: ["-Wall", "-fdata-sections", "-ffunction-sections", "-fno-exceptions", "-ggdb"],
        interrupts: controller.interrupts,
        documentation: documentation,
        documentationPage: documentationPage,
        documentationScale: documentationScale
    };
    let jsonObject = JSON.stringify(exports.projectSettings, null, "\t");
    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
    }
    fs.writeFile(path.join(projectPath, fileName), jsonObject, () => { });
}
exports.New = New;
function Replace(isOpenOCDConfigChanges = false) {
    if (exports.projectSettings.servertype === 'openocd' && isOpenOCDConfigChanges) {
        exports.projectSettings.openocdTransportPath = '';
        exports.projectSettings.openocdDevicePath = '';
        if (startup_1.context.globalState.get('openOCDPath') !== undefined && startup_1.context.globalState.get('openOCDPath') !== '') {
            let partialPath = startup_1.context.globalState.get('openOCDPath');
            exports.projectSettings.openocdTransportPath = path.join(partialPath, 'interface', exports.projectSettings.debugger + '.cfg');
            exports.projectSettings.openocdDevicePath = path.join(partialPath, 'target', exports.projectSettings.openocdTaskDevice + '.cfg');
            if (!fs.existsSync(exports.projectSettings.openocdTransportPath)) {
                vscode.window.showErrorMessage("Can't find " + exports.projectSettings.openocdTransportPath + ". Check OpenOCD Path");
            }
            if (!fs.existsSync(exports.projectSettings.openocdTransportPath)) {
                vscode.window.showErrorMessage("Can't find " + exports.projectSettings.openocdTransportPath + ". Check OpenOCD Path");
            }
        }
    }
    Write(exports.projectSettings);
}
exports.Replace = Replace;
function ChangeFlashStart(flashStart) {
    Get().then(settings => {
        settings.flashStart = flashStart;
        Write(settings);
    });
}
exports.ChangeFlashStart = ChangeFlashStart;
function ChangeStackSize(stackSize) {
    Get().then(settings => {
        settings.stackSize = stackSize;
        Write(settings);
    });
}
exports.ChangeStackSize = ChangeStackSize;
function ChangeHeapSize(heapSize) {
    Get().then(settings => {
        settings.heapSize = heapSize;
        Write(settings);
    });
}
exports.ChangeHeapSize = ChangeHeapSize;
function ChangeAsmFlags(asmFlags) {
    Get().then(settings => {
        settings.flagsASM = asmFlags;
        Write(settings);
    });
}
exports.ChangeAsmFlags = ChangeAsmFlags;
function ChangeCFlags(cFlags) {
    Get().then(settings => {
        settings.flagsC = cFlags;
        Write(settings);
    });
}
exports.ChangeCFlags = ChangeCFlags;
function ChangeCPPFlags(cppFlags) {
    Get().then(settings => {
        ;
        settings.flagsCPP = cppFlags;
        Write(settings);
    });
}
exports.ChangeCPPFlags = ChangeCPPFlags;
function ChangeStandardC(standardC) {
    Get().then(settings => {
        ;
        settings.standardC = standardC;
        Write(settings);
    });
}
exports.ChangeStandardC = ChangeStandardC;
function ChangeStandardCPP(standardCPP) {
    Get().then(settings => {
        ;
        settings.standardCPP = standardCPP;
        Write(settings);
    });
}
exports.ChangeStandardCPP = ChangeStandardCPP;
function ChangeOptimization(optimization) {
    Get().then(settings => {
        ;
        settings.optimization = optimization;
        Write(settings);
    });
}
exports.ChangeOptimization = ChangeOptimization;
function UpdateIncludes(includes, includesDir) {
    Get().then(settings => {
        ;
        settings.includes = includes;
        settings.includesDir = includesDir;
        Write(settings);
    });
}
exports.UpdateIncludes = UpdateIncludes;
function UpdateIncludesDir(includesDir) {
    Get().then(settings => {
        ;
        settings.includesDir = includesDir;
        Write(settings);
    });
}
exports.UpdateIncludesDir = UpdateIncludesDir;
function UpdateSources(sources) {
    Get().then(settings => {
        ;
        settings.sources = sources;
        Write(settings);
    });
}
exports.UpdateSources = UpdateSources;
function UpdateDefines(defines) {
    Get().then(settings => {
        ;
        settings.defines = defines;
        Write(settings);
    });
}
exports.UpdateDefines = UpdateDefines;
function Get() {
    return new Promise((resolve, reject) => {
        fs.readFile(fullPath, (err, data) => {
            if (data !== undefined) {
                ;
                exports.projectSettings = JSON.parse(data.toString());
                resolve(exports.projectSettings);
            }
        });
    });
}
exports.Get = Get;
function Write(jsonData) {
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
    }
    let jsonObject = JSON.stringify(jsonData, null, "\t");
    fs.writeFile(fullPath, jsonObject, () => { });
}
exports.Write = Write;
function GetDocumentationPosition(uri) {
    var name = path.basename(uri.toString(), '.pdf');
    if (!exports.projectSettings.documentation) {
        return undefined;
    }
    let i = 0;
    for (; i < exports.projectSettings.documentation.length; ++i) {
        if (path.basename(exports.projectSettings.documentation[i], '.pdf') === name) {
            return i;
        }
    }
    return undefined;
}
exports.GetDocumentationPosition = GetDocumentationPosition;
function PrepareDocumentation(documentation) {
    let docs = [];
    if (documentation) {
        docs = new Array(documentation.length);
        documentation.forEach((doc, index) => {
            let name = path.basename(doc) + ".pdf";
            docs[index] = path.join(startup_1.context.globalStoragePath, 'Documentation', doc, name);
        });
    }
    return docs;
}
exports.PrepareDocumentation = PrepareDocumentation;
//# sourceMappingURL=CortexBuilder.js.map