"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exec = exports.pdfProvider = exports.cortexBuilderProvider = exports.context = exports.controllersList = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const nCortexBuilder = require("./Creator/CortexBuilder");
const nSettings = require("./settings");
const nDownload = require("./download");
const pdfProvider_1 = require("./pdfProvider");
const cortexbuilderProvider_1 = require("./cortexbuilderProvider");
const CortexBuilder_1 = require("./Creator/CortexBuilder");
function exec(_context) {
    exports.context = _context;
    exports.cortexBuilderProvider = new cortexbuilderProvider_1.CortexBuilderProvider(exports.context);
    vscode.window.createTreeView('cortexBuilderProvider', {
        treeDataProvider: exports.cortexBuilderProvider
    });
    nDownload.GetControllerList().then(list => {
        vscode.commands.executeCommand('setContext', 'isControllersListReceived', true);
        vscode.commands.executeCommand('setContext', 'isBarExpanded', true);
        exports.controllersList = list;
        let settingsPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';
        if (settingsPath === undefined) {
            return;
        }
        settingsPath = path.join(settingsPath, '.vscode', 'cortexbuilder.json');
        if (fs.existsSync(settingsPath)) {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Preparing project",
                cancellable: false
            }, () => {
                const promise = new Promise(resolve => {
                    vscode.commands.executeCommand('setContext', 'isProjectOpened', true);
                    nCortexBuilder.Get().then(() => {
                        if (CortexBuilder_1.projectSettings.isFirstLaunch === true) {
                            let text = 'Open Settings?';
                            vscode.window.showInformationMessage(text, 'Yes', 'No').then(selecion => {
                                if (selecion === 'Yes') {
                                    setTimeout(() => nSettings.Show(), 1000);
                                }
                            });
                            CortexBuilder_1.projectSettings.isFirstLaunch = false;
                            nCortexBuilder.Replace();
                        }
                        let documentation = CortexBuilder_1.projectSettings.documentation ? CortexBuilder_1.projectSettings.documentation : [];
                        exports.cortexBuilderProvider.PushItems({ includes: CortexBuilder_1.projectSettings.includes,
                            includesDir: CortexBuilder_1.projectSettings.includesDir,
                            sources: CortexBuilder_1.projectSettings.sources }, CortexBuilder_1.projectSettings.deviceInc, documentation);
                        resolve();
                    });
                    exports.pdfProvider = new pdfProvider_1.PdfProvider(_context);
                });
                return promise;
            });
        }
    });
}
exports.exec = exec;
//# sourceMappingURL=startup.js.map