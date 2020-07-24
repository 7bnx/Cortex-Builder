"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exec = exports.treeViewProvider = exports.context = exports.controllersList = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const nCortexBuilder = require("./Creator/CortexBuilder");
const nWebView = require("./webView");
const nDownload = require("./download");
const TreeViewProvider_1 = require("./TreeViewProvider");
function exec(_context) {
    exports.context = _context;
    exports.treeViewProvider = new TreeViewProvider_1.TreeViewProvider(exports.context);
    vscode.window.createTreeView('treeViewProvider', {
        treeDataProvider: exports.treeViewProvider
    });
    nDownload.GetControllerList().then(list => {
        vscode.commands.executeCommand('setContext', 'isControllersListReceived', true);
        vscode.commands.executeCommand('setContext', 'isBarExpanded', true);
        exports.controllersList = list;
        let settingsPath = vscode.workspace.rootPath;
        if (settingsPath === undefined) {
            return;
        }
        settingsPath = path.join(settingsPath, '.vscode', 'cortexbuilder.json');
        if (fs.existsSync(settingsPath)) {
            vscode.commands.executeCommand('setContext', 'isProjectOpened', true);
            nCortexBuilder.Get().then(projectSettings => {
                if (projectSettings.isFirstLaunch === true) {
                    let text = 'Open Settings?';
                    vscode.window.showInformationMessage(text, 'Yes', 'No').then(selecion => {
                        if (selecion === 'Yes') {
                            setTimeout(() => nWebView.Show(), 1000);
                        }
                    });
                    projectSettings.isFirstLaunch = false;
                    nCortexBuilder.Replace();
                }
                exports.treeViewProvider.PushItems({ includes: projectSettings.includes,
                    includesDir: projectSettings.includesDir,
                    sources: projectSettings.sources }, projectSettings.deviceInc);
            });
        }
    });
}
exports.exec = exec;
//# sourceMappingURL=startup.js.map