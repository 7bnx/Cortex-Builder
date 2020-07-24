import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as nJsonSettings from '../JsonData/Settings';
import * as nJsonController from '../JsonData/Controller';

const fileName:string = "settings.json";
const fileDir:string = ".vscode";
const filePath:string = path.join((vscode.workspace.rootPath === undefined)? "" :vscode.workspace.rootPath,fileDir);

export function New(projectPath: string = filePath, controller: nJsonController.Data){
  if (projectPath !== filePath){projectPath = path.join(projectPath, fileDir);}
  let jsonData:nJsonSettings.Data = {
    "files.exclude":{
      "**/.vscode": false,
      "**/JLink": true,
      "**/.git*": true,
      "**/*.code-workspace": false,
      "**/cortexbuilder.json": true
    }
  };
  let jsonObject = JSON.stringify(jsonData, null, "\t");
  if (!fs.existsSync(projectPath)){fs.mkdirSync(projectPath, {recursive: true});}
  fs.writeFileSync(path.join(projectPath, fileName),jsonObject);
}