import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as nJsonLaunch from '../JsonData/Launch';
import * as nJsonController from '../JsonData/Controller';
import {context} from '../startup';
import {projectSettings} from './CortexBuilder';


const fileName:string = "launch.json";
const fileDir:string = ".vscode";
const filePath:string = path.join(vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath: '',fileDir);
const fullPath:string = path.join(filePath, fileName);



export function New(projectPath: string = filePath, controller:nJsonController.Data){
  let projectName = (projectPath.split(path.sep))[projectPath.split(path.sep).length - 1];
  if (projectPath !== filePath){projectPath = path.join(projectPath, fileDir);}
  let svdFile:string = path.join(context.globalStoragePath, 'SVD', controller.svd, controller.svd + '.svd');
  let _interface:string = "swd";
  let configuration:nJsonLaunch.Configuration = {
    name: "ARM-Debug",
    cwd: "${workspaceRoot}",
    executable: path.join("${workspaceRoot}", "output", projectName + ".elf"),
    svdFile: svdFile,
    request: "launch",
    type: "cortex-debug",
    servertype: projectSettings.servertype,
    device: controller.core,
    interface: _interface,
    runToMain: true,
    configFiles: [projectSettings.openocdTransportPath, projectSettings.openocdDevicePath]
  };
  let jsonData:nJsonLaunch.Data = {configurations: [configuration], version: "0.2.0"};
  let jsonObject = JSON.stringify(jsonData, null, "\t");
  if (!fs.existsSync(projectPath)){fs.mkdirSync(projectPath, {recursive: true});}
  fs.writeFile(path.join(projectPath, fileName),jsonObject, () => {});
}

export function Replace(_interface:string, isOpenOCDConfigChanges:boolean = false): Thenable<void>{
  return new Promise((resolve, reject) => {
    Get().then( launch => {
      launch.configurations[0].device = projectSettings.core;
      launch.configurations[0].svdFile = path.join(context.globalStoragePath, 'SVD', projectSettings.svd, projectSettings.svd + '.svd');
      launch.configurations[0].servertype = projectSettings.servertype;
      launch.configurations[0].interface = _interface;
      if (isOpenOCDConfigChanges){
        launch.configurations[0].configFiles = [projectSettings.openocdTransportPath, projectSettings.openocdDevicePath];
      }
      let jsonObject = JSON.stringify(launch, null, "\t");
      fs.writeFile(fullPath, jsonObject, () => {resolve();});
    });
  });
}

export function Get(): Promise<nJsonLaunch.Data>{
  return new Promise((resolve, reject) => {
    fs.readFile(fullPath, (err, data) => {
      if(data !== undefined){;
        let properties:nJsonLaunch.Data = JSON.parse(data.toString());
        resolve(properties);
      }
    });
  });
}


export function GetSync(): nJsonLaunch.Data{
  let data = fs.readFileSync(fullPath);
  let properties:nJsonLaunch.Data;
  properties = JSON.parse(data.toString());
  return properties;
}

export function GetOpenOCDConfigFiles():string[]{
  if (fs.existsSync(fullPath)){
    let launch:nJsonLaunch.Data = JSON.parse(fs.readFileSync(fullPath).toString());
    return launch.configurations[0].configFiles;
  } else{
    return [projectSettings.openocdTransportPath, projectSettings.openocdDevicePath];
  }
}
