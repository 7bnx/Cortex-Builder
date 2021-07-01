"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenocdCommand = exports.JlinkCommand = exports.Debug = exports.Reset = exports.Erase = exports.Read = exports.Flash = exports.Clean = exports.Build = exports.OpenProject = exports._resetOpeocdCommand = exports._eraseOpeocdCommand = exports._flashOpeocdCommand = void 0;
const vscode = require("vscode");
const path = require("path");
const CortexBuilder_1 = require("./Creator/CortexBuilder");
const nLaunch = require("./Creator/Launch");
const _windowsEchoEndCmd = " & echo. & echo Done";
const _windowsEchoEndPowerShell = "; echo \"`n\"; echo Done";
//const _windowsEchoEnd:string = "";
const _buildCommand = "make -s -j 10 all";
const _cleanCommand = "make -s clean";
function _flashOpeocdCommand() { return ` -c "init; reset halt; flash write_image erase output/${CortexBuilder_1.projectSettings.projectName}.hex; reset; exit"`; }
exports._flashOpeocdCommand = _flashOpeocdCommand;
exports._eraseOpeocdCommand = ` -c "init; reset halt; flash erase_sector 0 0 1; exit"`;
exports._resetOpeocdCommand = ` -c "init; reset; exit"`;
function writeCommand(command, taskName) {
    return new Promise((resolve, reject) => {
        let op = {
            executable: "cmd.exe",
            shellArgs: ["/C"],
        };
        let execution = new vscode.ShellExecution(command, op);
        let task = new vscode.Task({ type: 'shell' }, vscode.TaskScope.Workspace, taskName, ' ', execution);
        vscode.tasks.executeTask(task).then(() => { ; resolve(); });
    });
}
function OpenProject(projectPath, projectName) {
    return new Promise((resolve, reject) => {
        let terminal = vscode.window.activeTerminal;
        if (terminal === undefined) {
            terminal = vscode.window.createTerminal();
            terminal.sendText("code " + path.join(projectPath, projectName + ".code-workspace"));
            resolve();
        }
        else {
            writeCommand("code " + path.join(projectPath, projectName + ".code-workspace"), "Open").then(() => resolve());
        }
    });
}
exports.OpenProject = OpenProject;
function Build() {
    writeCommand(_buildCommand, "Build");
}
exports.Build = Build;
function Clean() {
    writeCommand(_cleanCommand, "Clean");
}
exports.Clean = Clean;
function Flash() {
    return new Promise((resolve, reject) => {
        let command = JlinkCommand('Flash');
        if (CortexBuilder_1.projectSettings.servertype === 'openocd') {
            command = OpenocdCommand(_flashOpeocdCommand());
        }
        writeCommand(command, "Flash").then(() => resolve());
    });
}
exports.Flash = Flash;
function Read() {
    let command = JlinkCommand('Read');
    if (CortexBuilder_1.projectSettings.servertype === 'openocd') {
        //command = OpenocdCommand(_eraseOpeocdCommand);
    }
    writeCommand(command, "Erase");
}
exports.Read = Read;
function Erase() {
    let command = JlinkCommand('Erase');
    if (CortexBuilder_1.projectSettings.servertype === 'openocd') {
        command = OpenocdCommand(exports._eraseOpeocdCommand);
    }
    writeCommand(command, "Erase");
}
exports.Erase = Erase;
function Reset() {
    let command = JlinkCommand('Reset');
    if (CortexBuilder_1.projectSettings.servertype === 'openocd') {
        command = OpenocdCommand(exports._resetOpeocdCommand);
    }
    writeCommand(command, "Reset");
}
exports.Reset = Reset;
function Debug() {
    /*
    ******Flash before start debugging
    Flash().then(() =>{
      setTimeout(() => vscode.commands.executeCommand("workbench.action.debug.start"), 1000);
    });
    */
    vscode.commands.executeCommand("workbench.action.debug.start");
}
exports.Debug = Debug;
function JlinkCommand(command) {
    return `JLink -Device ${CortexBuilder_1.projectSettings.jlinkTaskDevice} -If SWD -Speed 1000 JLink/${command}.jlink`;
}
exports.JlinkCommand = JlinkCommand;
function OpenocdCommand(command) {
    let _command = 'openocd';
    let configFiles = nLaunch.GetOpenOCDConfigFiles();
    configFiles.forEach(file => {
        _command += ' -f ' + file;
    });
    //let endCommand = vscode.ShellExecution.name === "powershell.exe" ? _windowsEchoEndPowerShell : _windowsEchoEndCmd;
    let endCommand = _windowsEchoEndCmd;
    _command += command + endCommand;
    return _command;
}
exports.OpenocdCommand = OpenocdCommand;
//# sourceMappingURL=terminalCommands.js.map