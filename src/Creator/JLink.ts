import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';

const ext:string = ".jlink";
const filePath:string = path.join((vscode.workspace.rootPath === undefined)? "" : path.join(vscode.workspace.rootPath, 'Jlink'));

export function New(projectName:string = '', projectPath:string = ''){
  if (projectName === '' || projectPath === ''){
    projectPath = filePath;
    projectName = (projectPath.split(path.sep))[projectPath.split(path.sep).length - 2];
  }
  else {projectPath = path.join(projectPath, 'JLink');}
  if (fs.existsSync(projectPath)){return;}
  const resetCommand:string = 'r\ng\nq';
  if (!fs.existsSync(projectPath)){fs.mkdirSync(projectPath, {recursive: true});}
  fs.writeFile(path.join(projectPath, 'Reset' + ext), resetCommand, () => {});
  const eraseCommand:string = 'erase\n' + resetCommand;
  fs.writeFile(path.join(projectPath, 'Erase' + ext), eraseCommand, () => {});
  let flashCommand:string = `r\nloadbin output/${projectName}.bin, 0x00\nverifybin output/${projectName}.bin, 0x00\n` + resetCommand;
  fs.writeFile(path.join(projectPath, 'Flash' + ext), flashCommand, () => {});
  let readCommand:string = 'savebin Read.bin, 0x00, 0x4000\n' + resetCommand;
  fs.writeFile(path.join(projectPath, 'Read' + ext), readCommand, () => {});
}
export function Delete(){
  rimraf(filePath);
}

function rimraf(dir_path: string) {
  if (fs.existsSync(dir_path)) {
      fs.readdirSync(dir_path).forEach(function(entry) {
          var entry_path = path.join(dir_path, entry);
          if (fs.lstatSync(entry_path).isDirectory()) {
              rimraf(entry_path);
          } else {
              fs.unlinkSync(entry_path);
          }
      });
      fs.rmdirSync(dir_path);
  }
}