"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewProject = void 0;
const vscode = require("vscode");
const path = require("path");
const nCreateVSCodeWorkspace = require("./Creator/VSCodeWorkspace");
const nC_CPP_Properties = require("./Creator/C_CPP_Properties");
const nLaunch = require("./Creator/Launch");
const nSettings = require("./Creator/Settings");
const nTasks = require("./Creator/Tasks");
const nMakefile = require("./Creator/Makefile");
const nLinker = require("./Creator/Linker");
const nStartup = require("./Creator/Startup");
const nNewProjectSource = require("./Creator/NewProjectSource");
const nCortexBuilder = require("./Creator/CortexBuilder");
const nTerminalCommands = require("./terminalCommands");
const nDownload = require("./download");
const nJLink = require("./Creator/JLink");
const startup_1 = require("./startup");
const CortexBuilder_1 = require("./Creator/CortexBuilder");
function createNewProject() {
    let controller;
    let projectPath;
    PickController().then(controllerName => {
        nDownload.GetController(controllerName).then(_controller => {
            nDownload.GetSVD(_controller.svd).then(() => {
                nDownload.GetCore().then(() => {
                    nDownload.GetInclude(_controller.include).then(() => {
                        controller = _controller;
                        if (projectPath !== undefined) {
                            SaveNewProject(controller, projectPath);
                        }
                    });
                });
            });
        });
        GetNewProjectPath().then(_projectPath => {
            projectPath = _projectPath;
            if (controller !== undefined) {
                SaveNewProject(controller, projectPath);
            }
        });
    });
}
exports.createNewProject = createNewProject;
function SaveNewProject(controller, projectPath) {
    nCortexBuilder.New(projectPath.directory, controller);
    nNewProjectSource.New(projectPath.name, projectPath.directory);
    nLinker.New(projectPath.directory, controller);
    nLaunch.New(projectPath.directory, controller);
    nSettings.New(projectPath.directory, controller);
    nTasks.New(projectPath.directory, controller);
    nMakefile.New(projectPath.directory, controller);
    nStartup.New(projectPath.directory, controller);
    nC_CPP_Properties.New(projectPath.directory, controller.include, [controller.define]);
    if (CortexBuilder_1.projectSettings.debugger === 'jlink') {
        nJLink.New(projectPath.name, projectPath.directory);
    }
    nCreateVSCodeWorkspace.New(projectPath.directory, controller).then(() => {
        let open = 'Open';
        let openNclose = 'Open and close current';
        let text = 'Open New Project?';
        vscode.window.showInformationMessage(text, open, openNclose).then(selection => {
            if (selection === undefined) {
                return;
            }
            nTerminalCommands.OpenProject(projectPath.directory, projectPath.name).then(value => {
                if (selection === openNclose) {
                    setTimeout(() => vscode.commands.executeCommand("workbench.action.closeWindow"), 5000);
                }
            });
        });
    });
}
function PickController() {
    return new Promise((resolve, reject) => {
        let QuickPickOptions = {
            placeHolder: "Select controller",
            matchOnDetail: true,
            matchOnDescription: true
        };
        vscode.window.showQuickPick(startup_1.controllersList, QuickPickOptions).then(value => {
            if (value !== undefined) {
                resolve(value.label);
            }
            else {
                reject();
            }
        });
    });
}
function GetNewProjectPath() {
    return new Promise((resolve, reject) => {
        let SaveDialogOptions = {
            saveLabel: "Create Project",
            filters: {
                VSWorkspace: ['code-workspace'],
            }
        };
        vscode.window.showSaveDialog(SaveDialogOptions).then(fileInfos => {
            if (fileInfos !== undefined) {
                let name = path.parse(fileInfos.fsPath).name;
                let dir = path.join(path.parse(fileInfos.fsPath).dir, name);
                let newProject = { "name": name, "directory": dir };
                resolve(newProject);
            }
        });
    });
}
//# sourceMappingURL=createNewProject.js.map