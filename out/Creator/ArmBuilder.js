"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Get = exports.UpdateDefines = exports.UpdateSources = exports.UpdateIncludesDir = exports.UpdateIncludes = exports.ChangeOptimization = exports.ChangeStandardCPP = exports.ChangeStandardC = exports.ChangeCPPFlags = exports.ChangeCFlags = exports.ChangeAsmFlags = exports.ChangeHeapSize = exports.ChangeStackSize = exports.ChangeFlashStart = exports.Replace = exports.New = exports.projectSettings = void 0;
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const startup_1 = require("../startup");
const fileName = "armbuilder.json";
const fileDir = ".vscode";
const filePath = path.join((vscode.workspace.rootPath === undefined) ? "" : vscode.workspace.rootPath, fileDir);
const fullPath = path.join(filePath, fileName);
function New(projectPath = filePath, controller) {
    let projectName = (projectPath.split(path.sep))[projectPath.split(path.sep).length - 1];
    let includesDir = [path.join(startup_1.context.globalStoragePath, 'Core'),
        path.join(startup_1.context.globalStoragePath, 'Include', controller.include),
        path.join(projectPath, 'user')];
    if (projectPath !== filePath) {
        projectPath = path.join(projectPath, fileDir);
    }
    let defaultServertype = 'jlink';
    if (startup_1.context.globalState.get('defaultServertype') !== undefined) {
        defaultServertype = startup_1.context.globalState.get('defaultServertype');
    }
    let defaultDebugger = 'jlink';
    if (startup_1.context.globalState.get('defaultDebugger') !== undefined) {
        defaultDebugger = startup_1.context.globalState.get('defaultDebugger');
    }
    let openocdTransport = '';
    let openocdDevice = '';
    if (defaultServertype === 'openocd') {
        if (startup_1.context.globalState.get('openOCDPath') !== undefined && startup_1.context.globalState.get('openOCDPath') !== '') {
            let partialPath = path.join(startup_1.context.globalState.get('openOCDPath'), 'share', 'openocd', 'scripts');
            openocdTransport = path.join(partialPath, 'interface', defaultDebugger + '.cfg');
            openocdDevice = path.join(partialPath, 'target', controller.openocdTaskDevice + '.cfg');
        }
    }
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
        standardC: 'c11',
        standardCPP: 'c++17',
        optimization: '-O1',
        projectType: 'C',
        sources: [],
        svd: controller.svd,
        jlinkTaskDevice: controller.jlinkTaskDevice,
        openocdTaskDevice: controller.openocdTaskDevice,
        openocdDevicePath: openocdDevice,
        openocdTransportPath: openocdTransport,
        servertype: defaultServertype,
        debugger: defaultDebugger,
        deviceInc: controller.include,
        includesDir: includesDir,
        includes: [],
        defines: [controller.define],
        flagsASM: ["-Wall", "-fdata-sections", "-ffunction-sections"],
        flagsC: ["-Wall", "-fdata-sections", "-ffunction-sections", "-ggdb"],
        flagsCPP: ["-Wall", "-fdata-sections", "-ffunction-sections", "-fno-exceptions", "-ggdb"],
        interrupts: controller.interrupts
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
            let partialPath = path.join(startup_1.context.globalState.get('openOCDPath'), 'share', 'openocd', 'scripts');
            exports.projectSettings.openocdTransportPath = path.join(partialPath, 'interface', exports.projectSettings.debugger + '.cfg');
            exports.projectSettings.openocdDevicePath = path.join(partialPath, 'target', exports.projectSettings.openocdTaskDevice + '.cfg');
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
//# sourceMappingURL=ArmBuilder.js.map