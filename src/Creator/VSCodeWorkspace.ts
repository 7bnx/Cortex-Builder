import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';
import * as nJsonVSCWorkspace from '../JsonData/VSCWorkspaceProject';
import * as nJsonController from '../JsonData/Controller';

  const fileName:string =
    (vscode.workspace.rootPath === undefined)? "":
    (vscode.workspace.rootPath.split(path.sep))[vscode.workspace.rootPath.split(path.sep).length - 1] + ".code-workspace";
  const filePath:string = path.join((vscode.workspace.rootPath === undefined)? "" :vscode.workspace.rootPath);
  const fullPath:string = path.join(filePath, fileName);

export function New(projectPath: string = filePath, controller: nJsonController.Data): Thenable<void>{
  return new Promise((resolve, reject) => {
    let projectName = (projectPath.split(path.sep))[projectPath.split(path.sep).length - 1];
    let folders:nJsonVSCWorkspace.Folder[] = [{path: '.'}];
    let jsonData:nJsonVSCWorkspace.JsonVSCWorkspace = {folders:folders};
    let jsonObject = JSON.stringify(jsonData, null, "\t");
    if (!fs.existsSync(projectPath)){fs.mkdirSync(projectPath, {recursive: true});}
    fs.writeFile(path.join(projectPath,projectName + ".code-workspace"),jsonObject, ( )=>{
      return resolve();
    });
  });
}

export function ChangeDefines(defines: string[]){
  Get().then(workspace => {
    let jsonObject = JSON.stringify(workspace, null, "\t");
    fs.writeFile(fullPath,jsonObject, () => {});
  });
}

function Get(): Promise<nJsonVSCWorkspace.JsonVSCWorkspace>{
  return new Promise((resolve, reject) => {
    fs.readFile(fullPath, (err, data) => {
      if(data !== undefined){
        let properties:nJsonVSCWorkspace.JsonVSCWorkspace = JSON.parse(data.toString());
        resolve(properties);
      }
    });
  });
}