import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as nJsonTasks from '../JsonData/Tasks';
import * as nJsonController from '../JsonData/Controller';
import * as nTerminalCommands from '../terminalCommands';
import {projectSettings} from './CortexBuilder';

const fileName:string = "tasks.json";
const fileDir:string = ".vscode";
const filePath:string = path.join((vscode.workspace.rootPath === undefined)? "" :vscode.workspace.rootPath,fileDir);
const fullPath:string = path.join(filePath, fileName);

export function New(projectPath: string = filePath, controller:nJsonController.Data){
  if (projectPath !== filePath){projectPath = path.join(projectPath, '.vscode');}
  Replace(controller.core, controller.jlinkTaskDevice, projectPath);
}

export function Replace(core:string, jlinkTaskDevice:string, projectPath:string = filePath){
  let jsonData:nJsonTasks.Data = {
    version: "2.0.0",
    tasks:[
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
  if (!fs.existsSync(projectPath)){fs.mkdirSync(projectPath, {recursive: true});}
  fs.writeFile(path.join(projectPath, fileName),jsonObject, () => {});
}

function TaskBuild(): nJsonTasks.Task{
  return ConfigTask("Build", "make -s -j 10 all", "build");
}

function TaskClean(): nJsonTasks.Task{
  return ConfigTask("Clean", "make -s clean", "build");
}

function TaskFlash(): nJsonTasks.Task{
  let command:string = nTerminalCommands.JlinkCommand('Flash');
  if (projectSettings.servertype === 'openocd' && projectSettings.debugger !== 'jlink'){
    command = nTerminalCommands.OpenocdCommand(nTerminalCommands._flashOpeocdCommand());
  }
  return ConfigTask("Write", command, "test");
}

function TaskRead(): nJsonTasks.Task{
  let command:string = nTerminalCommands.JlinkCommand('Read');
  return ConfigTask("Read", command, "test");
}

function TaskErase(): nJsonTasks.Task{
  let command:string = nTerminalCommands.JlinkCommand('Erase');
  if (projectSettings.servertype === 'openocd' && projectSettings.debugger !== 'jlink'){
    command = nTerminalCommands.OpenocdCommand(nTerminalCommands._eraseOpeocdCommand);
  }
  return ConfigTask("Erase", command, "test");
}

function TaskReset(): nJsonTasks.Task{
  let command:string = nTerminalCommands.JlinkCommand('Reset');
  if (projectSettings.servertype === 'openocd' && projectSettings.debugger !== 'jlink'){
    command = nTerminalCommands.OpenocdCommand(nTerminalCommands._resetOpeocdCommand);
  }
  return ConfigTask("Reset", command, "test");
}

function TaskStartGDB(): nJsonTasks.Task{
  let command:string = "start JLinkGDBServer.exe -select USB -device " + `${projectSettings.core}` +" -if SWD -speed 1000 -ir";
  return ConfigTask("Start GDB", command, "test");
}

function TaskDebug(): nJsonTasks.Task{
  var task: nJsonTasks.Task = {
    label: "Debag",
    dependsOrder: "sequence",
    dependsOn: ["Build", "Write", "dbg"],
    group:{
      kind: "test",
      isDefault: true
    },
    problemMatcher:[]
  };
  return task;
}

function Task_Debug(): nJsonTasks.Task{
  var task: nJsonTasks.Task = {
    label: "dbg",
    type: "process",
    command: "${command:workbench.action.debug.start}"
  };
  return task;
}

function ConfigTask(label: string, command: string, kind: string): nJsonTasks.Task{
  var task: nJsonTasks.Task = {
    label: label,
    type: "shell",
    command: command,
    options:{
      cwd: "${workspaceRoot}",
      shell: {
        executable: "cmd.exe",
        args:[
          "/C"
        ]
      }
    },
    presentation: {
      clear: true
    },
    group:{
      kind: kind,
      isDefault: true
    },
    problemMatcher:[]
  };
  return task;
}