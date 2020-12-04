import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';
import * as nJsonC_CPP_Properties from '../JsonData/C_CPP_Properties';
import {context} from '../startup';
import {projectSettings} from './CortexBuilder';


const fileName:string = "c_cpp_properties.json";
const fileDir:string = ".vscode";
const filePath:string = path.join(vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath: '',fileDir);
const fullPath:string = path.join(filePath, fileName);

export function New(projectPath: string = filePath, include: string, defines:string[]){
  let includesDir:string[] = [path.join(context.globalStoragePath, 'Core'), 
  path.join(context.globalStoragePath, 'Include', include),
  path.join(projectPath, 'user')];
  
  if (projectPath !== filePath){projectPath = path.join(projectPath, fileDir);}
  
  let compilerPath:string|undefined = context.globalState.get('compilerPath', '');
  let cStandard:string = context.globalState.get('cStandard', 'c11');
  let cppStandard:string = context.globalState.get('cppStandard', 'c++17');

  let configuration:nJsonC_CPP_Properties.Configuration = {
    name: "Cortex-Builder",
    compilerPath: compilerPath,
    defines:  defines,
    includePath: includesDir,
    cStandard: cStandard,
    cppStandard: cppStandard,
    intelliSenseMode: "${default}"
  };
  let jsonData:nJsonC_CPP_Properties.Data = {configurations: [configuration], version: 4};
  let jsonObject = JSON.stringify(jsonData, null, "\t");
  if (!fs.existsSync(projectPath)){ fs.mkdirSync(projectPath, {recursive: true});}
  fs.writeFile(path.join(projectPath, fileName),jsonObject, () =>{});
}

export function Replace(compilerPath:string){
  Get().then(properties =>{

    properties.configurations[0].includePath = projectSettings.includesDir;
    properties.configurations[0].defines = projectSettings.defines;
    properties.configurations[0].cStandard = projectSettings.standardC;
    properties.configurations[0].cppStandard = projectSettings.standardCPP;
    properties.configurations[0].compilerPath = compilerPath;
    Write(properties);
  });
}

export function UpdateIncludesDir(includes:string[]){
  Get().then(properties => {
    properties.configurations[0].includePath = includes;
    Write(properties);
  });
}

export function UpdateDefines(defines:string[]){
  Get().then(properties => {
     properties.configurations[0].defines = defines;
    Write(properties);
  });
}

export function ChangeCompilerPath(newCompilerPath:string){
  Get().then(properties => {
    if (properties.configurations[0].compilerPath !== newCompilerPath){
      properties.configurations[0].compilerPath = newCompilerPath;
      Write(properties);
    }
  });
}

export function ChangeCStandard(newCStandard:string){
  ChangeStandard(newCStandard, true);
}

export function ChangeCPPStandard(newCStandard:string){
  if (newCStandard === "gnu++2a"){newCStandard = "gnu++20";}
  else if (newCStandard === "c++2a"){newCStandard = "c++20";}
  ChangeStandard(newCStandard, false);
}

export function ChangeStandard(newStandard:string, isCChange:boolean){
  Get().then(properties => {
    if (isCChange){properties.configurations[0].cStandard = newStandard;}
    else {properties.configurations[0].cppStandard = newStandard;};
    Write(properties);
  });
}
  
function Get(): Promise<nJsonC_CPP_Properties.Data>{
  return new Promise((resolve, reject) => {
    fs.readFile(fullPath, (err, data) => {
      if(data !== undefined){;
        let properties:nJsonC_CPP_Properties.Data = JSON.parse(data.toString());
          resolve(properties);
      }
    });
  });
}

function Write(jsonData:nJsonC_CPP_Properties.Data){
  if (!fs.existsSync(filePath)){fs.mkdirSync(filePath, {recursive: true});}
  let jsonObject = JSON.stringify(jsonData, null, "\t");
  fs.writeFile(fullPath,jsonObject, () =>{});
}