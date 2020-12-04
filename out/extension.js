"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const nNewProject = require("./createNewProject");
const nStartup = require("./startup");
const nTerminalCommands = require("./terminalCommands");
const nSettings = require("./settings");
function activate(context) {
    nStartup.exec(context);
    let build = vscode.commands.registerCommand('task.build', () => {
        nTerminalCommands.Build();
    });
    let clean = vscode.commands.registerCommand('task.clean', () => {
        nTerminalCommands.Clean();
    });
    let flash = vscode.commands.registerCommand('task.flash', () => {
        nTerminalCommands.Flash();
    });
    let erase = vscode.commands.registerCommand('task.erase', () => {
        nTerminalCommands.Erase();
    });
    let reset = vscode.commands.registerCommand('task.reset', () => {
        nTerminalCommands.Reset();
    });
    let debug = vscode.commands.registerCommand('task.debug', () => {
        nTerminalCommands.Debug();
    });
    let settings = vscode.commands.registerCommand('task.settings', () => {
        nSettings.Show();
    });
    let newProject = vscode.commands.registerCommand('task.newProject', () => {
        nNewProject.createNewProject();
    });
    let expand = vscode.commands.registerCommand('task.expand', () => {
        vscode.commands.executeCommand('setContext', 'isBarExpanded', true);
    });
    let collapse = vscode.commands.registerCommand('task.collapse', () => {
        vscode.commands.executeCommand('setContext', 'isBarExpanded', false);
    });
    context.subscriptions.push(build);
    context.subscriptions.push(clean);
    context.subscriptions.push(flash);
    context.subscriptions.push(erase);
    context.subscriptions.push(reset);
    context.subscriptions.push(debug);
    context.subscriptions.push(settings);
    context.subscriptions.push(newProject);
    context.subscriptions.push(expand);
    context.subscriptions.push(collapse);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
;
//# sourceMappingURL=extension.js.map