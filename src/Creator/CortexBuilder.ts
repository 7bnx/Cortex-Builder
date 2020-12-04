import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as nJsonCortexBuilder from '../JsonData/CortexBuilder';
import * as nJsonController from '../JsonData/Controller';
import {context} from '../startup';


const fileName:string = "cortexbuilder.json";
const fileDir:string = ".vscode";
const filePath:string = path.join(vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath: '',fileDir);
const fullPath:string = path.join(filePath, fileName);
export var projectSettings:nJsonCortexBuilder.Data;

export function New(projectPath: string = filePath, controller:nJsonController.Data){
  let projectName = (projectPath.split(path.sep))[projectPath.split(path.sep).length - 1];
  let includesDir:string[] = [path.join(context.globalStoragePath, 'Core'), 
    path.join(context.globalStoragePath, 'Include', controller.include),
    path.join(projectPath, 'user')];
  if (projectPath !== filePath){projectPath = path.join(projectPath, fileDir);}

  let projectType:string = context.globalState.get('projectType', 'C');
  let cStandard:string = context.globalState.get('cStandard', 'c11');
  let cppStandard:string = context.globalState.get('cppStandard', 'c++17');
  let optimization:string = context.globalState.get('optimization', '-O1');
  let debugger_:string = context.globalState.get('debugger', 'jlink');
  let servertype:string = context.globalState.get('servertype', 'jlink');
  let openocdTransport:string = '';
  let openocdDevice:string = '';
  if (servertype === 'openocd'){
    let rootPath:string = context.globalState.get('openOCDPath','');
    if (rootPath !== ''){
      //rootPath = path.join(rootPath, 'share', 'openocd', 'scripts');
      openocdTransport = path.join(rootPath, 'interface', debugger_ + '.cfg');
      openocdDevice = path.join(rootPath, 'target', controller.openocdTaskDevice + '.cfg');
      if (!fs.existsSync(openocdTransport)){vscode.window.showErrorMessage("Can't find " + openocdTransport + ". Check OpenOCD Path");}
      if (!fs.existsSync(openocdTransport)){vscode.window.showErrorMessage("Can't find " + openocdDevice + ". Check OpenOCD Path");}
    }
  }
  let documentation = PrepareDocumentation(controller.documentation);

  let documentationPage = new Array<number>(documentation.length).fill(1);
  let documentationScale = new Array<string>(documentation.length).fill('page-width');
  projectSettings = {
    projectName: projectName,
    isFirstLaunch: true,
    controller: controller.name,
    core: controller.core,
    flashStart: controller.flashStart,
    flashSizeK: controller.flashSizeK,
    flashSizeHex: controller.flashSizeHex,
    flashPageSize: controller.flashPageSize,
    ramStart: controller.ramStart,
    ramSizeK: controller.ramSizeK,
    ramSizeHex: controller.ramSizeHex,
    ramEnd: controller.ramEnd,
    stackSize: controller.stackSize,
    heapSize: controller.heapSize,
    startupFPU: controller.startupFPU,
    makefileFPU: controller.makefileFPU,
    makefileFLOATABI: controller.makefileFLOATABI,
    standardC: cStandard,
    standardCPP: cppStandard,
    optimization: optimization,
    projectType:  projectType,
    sources: [],
    svd: controller.svd,
    jlinkTaskDevice: controller.jlinkTaskDevice,
    openocdTaskDevice: controller.openocdTaskDevice,
    openocdDevicePath: openocdDevice,
    openocdTransportPath: openocdTransport,
    servertype: servertype,
    debugger: debugger_,
    deviceInc: controller.include,
    includesDir: includesDir,
    includes: [],
    defines: [controller.define],
    flagsASM: ["-Wall", "-fdata-sections", "-ffunction-sections"],
    flagsC: ["-Wall","-fdata-sections", "-ffunction-sections", "-ggdb"],
    flagsCPP:  ["-Wall", "-fdata-sections","-ffunction-sections","-fno-exceptions","-ggdb"],
    interrupts: controller.interrupts,
    documentation: documentation,
    documentationPage: documentationPage,
    documentationScale: documentationScale
  };
  let jsonObject = JSON.stringify(projectSettings, null, "\t");
  if (!fs.existsSync(projectPath)){fs.mkdirSync(projectPath, {recursive: true});}
  fs.writeFile(path.join(projectPath, fileName),jsonObject, () => {});

}

export function Replace(isOpenOCDConfigChanges:boolean = false){
  if (projectSettings.servertype === 'openocd' && isOpenOCDConfigChanges){
    projectSettings.openocdTransportPath = '';
    projectSettings.openocdDevicePath = '';
    if (context.globalState.get('openOCDPath') !== undefined && context.globalState.get('openOCDPath') !== ''){
      let partialPath = context.globalState.get('openOCDPath') as string;
      projectSettings.openocdTransportPath = path.join(partialPath, 'interface', projectSettings.debugger + '.cfg');
      projectSettings.openocdDevicePath = path.join(partialPath, 'target', projectSettings.openocdTaskDevice + '.cfg');
      if (!fs.existsSync(projectSettings.openocdTransportPath)){vscode.window.showErrorMessage("Can't find " + projectSettings.openocdTransportPath + ". Check OpenOCD Path");}
      if (!fs.existsSync(projectSettings.openocdTransportPath)){vscode.window.showErrorMessage("Can't find " + projectSettings.openocdTransportPath + ". Check OpenOCD Path");}
    }
  }
  Write(projectSettings);
}

export function ChangeFlashStart(flashStart: string){
  Get().then(settings =>{
    settings.flashStart = flashStart;
    Write(settings);
  });
}

export function ChangeStackSize(stackSize: string){
  Get().then(settings =>{
    settings.stackSize = stackSize;
    Write(settings);
  });
}

export function ChangeHeapSize(heapSize: string){
  Get().then(settings =>{
    settings.heapSize = heapSize;
    Write(settings);
  });
}

export function ChangeAsmFlags(asmFlags: string[]){
  Get().then(settings =>{
    settings.flagsASM = asmFlags;
    Write(settings);
  });
}

export function ChangeCFlags(cFlags: string[]){
  Get().then(settings =>{
    settings.flagsC = cFlags;
    Write(settings);
  });
}

export function ChangeCPPFlags(cppFlags: string[]){
  Get().then(settings =>{;
    settings.flagsCPP = cppFlags;
    Write(settings);
  });
}

export function ChangeStandardC(standardC: string){
  Get().then(settings =>{;
    settings.standardC = standardC;
    Write(settings);
  });
}

export function ChangeStandardCPP(standardCPP: string){
  Get().then(settings =>{;
    settings.standardCPP = standardCPP;
    Write(settings);
  });
}

export function ChangeOptimization(optimization: string){
  Get().then(settings =>{;
    settings.optimization = optimization;
    Write(settings);
  });
}

export function UpdateIncludes(includes: string[], includesDir: string[]){
  Get().then(settings =>{;
    settings.includes = includes;
    settings.includesDir = includesDir;
    Write(settings);
  });
}

export function UpdateIncludesDir(includesDir: string[]){
  Get().then(settings =>{;
    settings.includesDir = includesDir;
    Write(settings);
  });
}

export function UpdateSources(sources: string[]){
  Get().then(settings =>{;
    settings.sources = sources;
    Write(settings);
  });
}

export function UpdateDefines(defines: string[]){
  Get().then(settings =>{;
    settings.defines = defines;
    Write(settings);
  });
}

export function Get(): Promise<nJsonCortexBuilder.Data>{
  return new Promise((resolve, reject) => {
    fs.readFile(fullPath, (err, data) => {
      if(data !== undefined){;
        projectSettings = JSON.parse(data.toString());
        resolve(projectSettings);
      }
    });
  });
}

export function Write(jsonData:nJsonCortexBuilder.Data){
  
  if (!fs.existsSync(filePath)){fs.mkdirSync(filePath, {recursive: true});}
  let jsonObject = JSON.stringify(jsonData, null, "\t");
  fs.writeFile(fullPath,jsonObject, () =>{});
}

export function GetDocumentationPosition(uri: vscode.Uri) : number | undefined{
  var name = path.basename(uri.toString(), '.pdf');
  if (!projectSettings.documentation){return undefined;}
  let i: number = 0;
  for(; i < projectSettings.documentation.length; ++i){
    if (path.basename(projectSettings.documentation[i], '.pdf') === name){
      return i;
    }
  }
  return undefined;
}

export function PrepareDocumentation(documentation:string[]): string[]{
  let docs:string[] = [];
  if (documentation) {
    docs = new Array(documentation.length);
    documentation.forEach((doc, index) =>{
      let name = path.basename(doc) + ".pdf";
      docs[index] = path.join(context.globalStoragePath, 'Documentation', doc, name);
    });
  }
  return docs;
}