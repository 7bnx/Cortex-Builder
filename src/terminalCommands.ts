import * as vscode from 'vscode';
import * as path from 'path';
import {projectSettings} from './Creator/CortexBuilder';
import * as nLaunch from './Creator/Launch';

const _windowsEchoEnd:string = " & echo. & echo Done";
const _buildCommand:string = "make -s -j 10 all";
const _cleanCommand:string = "make -s clean";
export function _flashOpeocdCommand():string {return ` -c "init; reset halt; flash write_image erase output/${projectSettings.projectName}.hex; reset; exit"`;}
export const _eraseOpeocdCommand:string = ` -c "init; reset halt; flash erase_sector 0 0 1; exit"`;
export const _resetOpeocdCommand:string = ` -c "init; reset; exit"`;

function writeCommand(command: string, taskName: string): Thenable<void>{
  return new Promise((resolve, reject) => {
    let op:vscode.ShellExecutionOptions = {
      executable: "cmd.exe",
      shellArgs: ["/C"],
    };
    let execution = new vscode.ShellExecution(
        command, op);
    let task = new vscode.Task(
      { type: 'shell'},
      vscode.TaskScope.Workspace,
      taskName,
      ' ',
      execution);
      vscode.tasks.executeTask(task).then(() => {;resolve();});
  });
}

export function OpenProject(projectPath:string, projectName:string): Thenable<void>{
  return new Promise((resolve, reject) => {
    let terminal = vscode.window.activeTerminal;
    if (terminal === undefined) {
      terminal = vscode.window.createTerminal();
      terminal.sendText("code " + path.join(projectPath, projectName + ".code-workspace"));
      resolve();
    }
    else{
      writeCommand("code " + path.join(projectPath, projectName + ".code-workspace"), "Open").then(() => resolve());
    }
  });
}

export function Build(){
  writeCommand(_buildCommand, "Build");
}

export function Clean(){
  writeCommand(_cleanCommand, "Clean");
}

export function Flash(): Thenable<void> {
  return new Promise((resolve, reject) => {
    let command = JlinkCommand('Flash');
    if (projectSettings.servertype === 'openocd'){
      command = OpenocdCommand(_flashOpeocdCommand());
    }
    writeCommand(command, "Flash").then(() => resolve());
  });
}

export function Read(){
  let command = JlinkCommand('Read');
  if (projectSettings.servertype === 'openocd'){
      //command = OpenocdCommand(_eraseOpeocdCommand);
  }
  writeCommand(command, "Erase");
}

export function Erase(){
  let command = JlinkCommand('Erase');
  if (projectSettings.servertype === 'openocd'){
      command = OpenocdCommand(_eraseOpeocdCommand);
  }
  writeCommand(command, "Erase");
}

export function Reset(){
  let command = JlinkCommand('Reset');
  if (projectSettings.servertype === 'openocd'){
    command = OpenocdCommand(_resetOpeocdCommand);
  }
  writeCommand(command, "Reset");
}

export function Debug(){
  /*
  ******Flash before start debugging
  Flash().then(() =>{
    setTimeout(() => vscode.commands.executeCommand("workbench.action.debug.start"), 1000);
  });
  */
  vscode.commands.executeCommand("workbench.action.debug.start");
}

export function JlinkCommand(command:string):string{
  return `JLink -Device ${projectSettings.jlinkTaskDevice} -If SWD -Speed 1000 JLink/${command}.jlink`;
}

export function OpenocdCommand(command:string):string{
  let _command:string = 'openocd';
  let configFiles = nLaunch.GetOpenOCDConfigFiles();
  configFiles.forEach(file => {
    _command += ' -f ' + file; 
  });
  _command += command + _windowsEchoEnd;
  return _command; 
}