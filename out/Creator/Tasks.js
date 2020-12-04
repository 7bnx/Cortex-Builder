"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Replace = exports.New = void 0;
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const nTerminalCommands = require("../terminalCommands");
const CortexBuilder_1 = require("./CortexBuilder");
const fileName = "tasks.json";
const fileDir = ".vscode";
const filePath = path.join(vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '', fileDir);
const fullPath = path.join(filePath, fileName);
function New(projectPath = filePath, controller) {
    if (projectPath !== filePath) {
        projectPath = path.join(projectPath, '.vscode');
    }
    Replace(controller.core, controller.jlinkTaskDevice, projectPath);
}
exports.New = New;
function Replace(core, jlinkTaskDevice, projectPath = filePath) {
    let jsonData = {
        version: "2.0.0",
        tasks: [
            TaskBuild(),
            TaskClean(),
            TaskFlash(),
            //TaskRead(),
            TaskErase(),
            TaskReset(),
            //TaskStartGDB(),
            Task_Debug(),
            TaskDebug()
        ]
    };
    let jsonObject = JSON.stringify(jsonData, null, "\t");
    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
    }
    fs.writeFile(path.join(projectPath, fileName), jsonObject, () => { });
}
exports.Replace = Replace;
function TaskBuild() {
    return ConfigTask("Build", "make -s -j 10 all", "build");
}
function TaskClean() {
    return ConfigTask("Clean", "make -s clean", "build");
}
function TaskFlash() {
    let command = nTerminalCommands.JlinkCommand('Flash');
    if (CortexBuilder_1.projectSettings.servertype === 'openocd' && CortexBuilder_1.projectSettings.debugger !== 'jlink') {
        command = nTerminalCommands.OpenocdCommand(nTerminalCommands._flashOpeocdCommand());
    }
    return ConfigTask("Write", command, "test");
}
function TaskRead() {
    let command = nTerminalCommands.JlinkCommand('Read');
    return ConfigTask("Read", command, "test");
}
function TaskErase() {
    let command = nTerminalCommands.JlinkCommand('Erase');
    if (CortexBuilder_1.projectSettings.servertype === 'openocd' && CortexBuilder_1.projectSettings.debugger !== 'jlink') {
        command = nTerminalCommands.OpenocdCommand(nTerminalCommands._eraseOpeocdCommand);
    }
    return ConfigTask("Erase", command, "test");
}
function TaskReset() {
    let command = nTerminalCommands.JlinkCommand('Reset');
    if (CortexBuilder_1.projectSettings.servertype === 'openocd' && CortexBuilder_1.projectSettings.debugger !== 'jlink') {
        command = nTerminalCommands.OpenocdCommand(nTerminalCommands._resetOpeocdCommand);
    }
    return ConfigTask("Reset", command, "test");
}
function TaskStartGDB() {
    let command = "start JLinkGDBServer.exe -select USB -device " + `${CortexBuilder_1.projectSettings.core}` + " -if SWD -speed 1000 -ir";
    return ConfigTask("Start GDB", command, "test");
}
function TaskDebug() {
    var task = {
        label: "Debag",
        dependsOrder: "sequence",
        dependsOn: ["Build", "Write", "dbg"],
        group: {
            kind: "test",
            isDefault: true
        },
        problemMatcher: []
    };
    return task;
}
function Task_Debug() {
    var task = {
        label: "dbg",
        type: "process",
        command: "${command:workbench.action.debug.start}"
    };
    return task;
}
function ConfigTask(label, command, kind) {
    var task = {
        label: label,
        type: "shell",
        command: command,
        options: {
            cwd: "${workspaceRoot}",
            shell: {
                executable: "cmd.exe",
                args: [
                    "/C"
                ]
            }
        },
        presentation: {
            clear: true
        },
        group: {
            kind: kind,
            isDefault: true
        },
        problemMatcher: []
    };
    return task;
}
//# sourceMappingURL=Tasks.js.map