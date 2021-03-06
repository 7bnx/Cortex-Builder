import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as nStartup from './startup';
import * as nCortexBuilder from './Creator/CortexBuilder';
import * as nC_CPP_Properties from './Creator/C_CPP_Properties';
import * as nLinker from './Creator/Linker';
import * as nLaunch from './Creator/Launch';
import * as nStartupCreator from './Creator/Startup';
import * as nTasks from './Creator/Tasks';
import * as nJsonController from './JsonData/Controller';
import * as nMakefile from './Creator/Makefile';
import * as nDownload from './download';
import * as nJLink from './Creator/JLink';
import {projectSettings} from './Creator/CortexBuilder';

var panel:vscode.WebviewPanel | undefined = undefined;
var controllers:string[] = [];
const onDiskCSS = vscode.Uri.file(path.join(__dirname, '..','resources', 'html', 'settings.css'));
const onDiskJS = vscode.Uri.file(path.join(__dirname, '..', 'resources', 'html', 'settings.js'));

var htmlContent:string = '';
export function Show(){
  const columnToShowIn = vscode.window.activeTextEditor
  ? vscode.window.activeTextEditor.viewColumn
  : undefined;

  if (panel !== undefined) {
    // If we already have a panel, show it in the target column
    panel.reveal(columnToShowIn);
  } else {
    // Otherwise, create a new panel
    panel = vscode.window.createWebviewPanel(
      'cortexbuilderSettings',
      'Cortex Builder Settings',
      vscode.ViewColumn.One,
      {
        localResourceRoots: [vscode.Uri.file(path.join(__dirname, '..', 'resources', 'html'))],
        enableScripts: true,
        retainContextWhenHidden: true,
        enableFindWidget: false
      }
    );

    const settingsCSS = panel.webview.asWebviewUri(onDiskCSS);
    const settingsJS = panel.webview.asWebviewUri(onDiskJS);
    htmlContent = fs.readFileSync(path.join(__dirname, '..', 'resources', 'html', 'settings.html')).toString().replace('settings.css',settingsCSS.toString()).replace('settings.js', settingsJS.toString());

    panel.webview.html = htmlContent;
    panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'setCompilerPath':
            setCompilerPath();
            break;
          case 'setOpenOCDPath':
            setOpenOCDPath();
            break;
          case 'setSettings':
            vscode.window.withProgress({
              location: vscode.ProgressLocation.Notification,
              title: "Saving settings",
              cancellable: false
            }, () => {
              const promise = new Promise(resolve => {
                Settings(message).then(() =>{resolve();});
              });
              return promise;
            });
            break;
        }
      },
    );

    postSettingsMessage();
  
    panel.onDidDispose(
      () => {
        panel = undefined;
      },
      null,
      nStartup.context.subscriptions
    );
  }

}

function postSettingsMessage(){
  if (controllers.length === 0){
    nStartup.controllersList.forEach(controller => {
      controllers.push(controller.label);
    });
  }
  let general = {
    compilerPath: nStartup.context.globalState.get('compilerPath',''),
    openOCDPath: nStartup.context.globalState.get('openOCDPath', '')
  };
  if (panel === undefined) {return;}
  panel.webview.postMessage({command: 'setSettings', 
  data:{controllers: controllers, settings: projectSettings, general: general}});
}

function setCompilerPath(){
  let openDialogOptions: vscode.OpenDialogOptions = {
    canSelectFiles: true,
    canSelectMany: false,
    canSelectFolders: false,
    filters:{
      source: ['exe']
    }
  };
  vscode.window.showOpenDialog(openDialogOptions).then(files =>{
    if (files !== undefined && panel !== undefined){
      let str = files[0].fsPath;
      panel.webview.postMessage({command: 'setCompilerPath', data: str});
    }
  });
}

function setOpenOCDPath(){
  let openDialogOptions: vscode.OpenDialogOptions = {
    canSelectFiles: false,
    canSelectMany: false,
    canSelectFolders: true,
  };
  vscode.window.showOpenDialog(openDialogOptions).then(folder =>{
    if (folder !== undefined && panel !== undefined){
      let str = folder[0].fsPath;
      let check = path.join(str, 'target');
      if (!fs.existsSync(check)){
        str = '';
        vscode.window.showErrorMessage('Wrong openOCD path. Destination should include \'target\' and \'interface\' folders');
      }
      panel.webview.postMessage({command: 'setOpenOCDPath', data: str});
    }
  });
}

function Settings(data:any): Promise<void>{
  return new Promise((resolve, reject) => {
    vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    if (projectSettings.controller !== data.controller){
      DownloadNewFiles(data.controller).then((newController) =>{
        SettingsNewController(newController, data).then(() => {resolve();});
      });
    }
    else{SettingsCommon(data).then(() => {resolve();});}
  });
}


function SettingsNewController(newController: nJsonController.Data, data: any): Promise<void>{
  return new Promise((resolve, reject) => {
      let oldController = GetController(projectSettings.controller);
      if(oldController.define !== newController.define){
        let tmpDefines:string[] = [newController.define];
        for(let i = 0; i < data.defines.length; ++i){
          if (data.defines[i] !== oldController.define){
            tmpDefines.push(data.defines[i]);
          }
        }
        data.defines = tmpDefines;
      }
      if(oldController.include !== newController.include){
        let incDir = path.join(nStartup.context.globalStoragePath, 'Include', oldController.include);
        let inc = path.join(incDir, oldController.include + '.h');
        let tmpInc:string[] = [path.join(nStartup.context.globalStoragePath, 'Include', newController.include, newController.include + '.h')];
        let tmpIncDir:string[] = [path.join(nStartup.context.globalStoragePath, 'Include', newController.include)];
        for(let i = 0; i < projectSettings.includesDir.length; ++i){
          if (projectSettings.includesDir[i] !== incDir){
            tmpIncDir.push(projectSettings.includesDir[i]);
          }
        }
        for(let i = 0; i < projectSettings.includes.length; ++i){
          if (projectSettings.includes[i] !== inc){
            tmpInc.push(projectSettings.includes[i]);
          }
        }
        projectSettings.includesDir = tmpIncDir;
        projectSettings.includes = tmpInc;
      }

      projectSettings.core = newController.core;
      projectSettings.flashSizeK = newController.flashSizeK;
      projectSettings.flashSizeHex = newController.flashSizeHex;
      projectSettings.flashPageSize = newController.flashPageSize;
      projectSettings.ramStart = newController.ramStart;
      projectSettings.ramSizeK = newController.ramSizeK;
      projectSettings.ramSizeHex = newController.ramSizeHex;
      projectSettings.ramEnd = newController.ramEnd;
      projectSettings.startupFPU = newController.startupFPU;
      projectSettings.makefileFPU = newController.makefileFPU;
      projectSettings.makefileFLOATABI = newController.makefileFLOATABI;
      projectSettings.svd = newController.svd;
      projectSettings.jlinkTaskDevice = newController.jlinkTaskDevice;
      projectSettings.openocdTaskDevice = newController.openocdTaskDevice;
      projectSettings.deviceInc = newController.include;
      projectSettings.interrupts = newController.interrupts;
      projectSettings.documentation = nCortexBuilder.PrepareDocumentation(newController.documentation);
      projectSettings.documentationPage = new Array<number>(projectSettings.documentation.length).fill(1);
      projectSettings.documentationScale = new Array<string>(projectSettings.documentation.length).fill("page-width");
      nStartup.cortexBuilderProvider.PushItems({includes: projectSettings.includes, includesDir: projectSettings.includesDir,
                                    sources: projectSettings.sources}, projectSettings.deviceInc, projectSettings.documentation);
                                    
      SettingsCommon(data, true).then(() => resolve());
  });
}

function SettingsCommon(data:any, state: boolean = false): Promise<void>{
  return new Promise((resolve, reject) => {

    let isCortexBuilderChanges = state;
    let isMakeFileChanges = state;
    let isStartupChanges = state;
    let isLinkerChanges = state;
    let isLaunchChanges = state;
    let isSettingsChanges = state;
    let isC_CPP_PropertiesChanges = state;
    let isTasksChanges = state;
    let isOpenOCDConfigChanges = state;
  
    if (projectSettings.flashStart !== data.flashStart || 
        projectSettings.stackSize !== data.stackSize ||
        projectSettings.heapSize !== data.heapSize){
      isCortexBuilderChanges = true;
      isLinkerChanges = true;
    }
    if (projectSettings.standardC !== data.standardC ||
        projectSettings.standardCPP !== data.standardCPP ||
        projectSettings.optimization !== data.optimization){
  
      if (projectSettings.standardC !== data.standardC ){
        nStartup.context.globalState.update('cStandard', data.standardC);
      }
      if (projectSettings.standardCPP !== data.standardCPP){
        nStartup.context.globalState.update('cppStandard', data.standardCPP);
      }
      if (projectSettings.optimization !== data.optimization){
        nStartup.context.globalState.update('optimization', data.optimization);
      }
      isCortexBuilderChanges = true;
      isC_CPP_PropertiesChanges = true;
      isMakeFileChanges = true;
    }
    if (!IsArraysMatch(projectSettings.flagsASM, data.flagsASM) ||
        !IsArraysMatch(projectSettings.flagsC, data.flagsC) ||
        !IsArraysMatch(projectSettings.flagsCPP, data.flagsCPP)){
      isCortexBuilderChanges = true;
      isMakeFileChanges = true;
    }
    let compilerPath = data.compilerPath;
    if (compilerPath !== nStartup.context.globalState.get('compilerPath')){
      nStartup.context.globalState.update('compilerPath', data.compilerPath);
      isC_CPP_PropertiesChanges = true;
    }
    let openOCDPath = data.openOCDPath;
    if (openOCDPath !== nStartup.context.globalState.get('openOCDPath')){
      nStartup.context.globalState.update('openOCDPath', data.openOCDPath);
      isCortexBuilderChanges = true;
      isLinkerChanges = true;
      isOpenOCDConfigChanges = true;
    }
    if (data.servertype !== projectSettings.servertype){
      nStartup.context.globalState.update('servertype', data.servertype);
      isCortexBuilderChanges = true;
      isLaunchChanges = true;
    }
    if (data.servertype === 'jlink'){
      data.debugger = 'jlink';
    }
    if (data.servertype === 'openocd' || (data.debugger !== projectSettings.debugger && data.servertype === 'openocd')){
      nStartup.context.globalState.update('debugger', data.debugger);
      isCortexBuilderChanges = true;
      let configFiles = nLaunch.GetOpenOCDConfigFiles();
      if (configFiles.length === 0 || (configFiles.length === 2 &&
          configFiles[0] === projectSettings.openocdTransportPath && 
          configFiles[1] === projectSettings.openocdDevicePath)){
        isLaunchChanges = true;
        isOpenOCDConfigChanges = true;
        isTasksChanges = true;
      }
    }
    if (data.projectType !== projectSettings.projectType){
      nStartup.context.globalState.update('projectType', data.projectType);
      isMakeFileChanges = true;
      isCortexBuilderChanges = true;
    }
    if(!IsArraysMatch(projectSettings.defines, data.defines)){
      isMakeFileChanges = true;
      isC_CPP_PropertiesChanges = true;
      isCortexBuilderChanges = true;
    }
    projectSettings.controller = data.controller;
    projectSettings.flashStart = data.flashStart;
    projectSettings.stackSize = data.stackSize;
    projectSettings.heapSize = data.heapSize;
    projectSettings.standardC = data.standardC;
    projectSettings.standardCPP = data.standardCPP;
    projectSettings.optimization = data.optimization;
    projectSettings.projectType = data.projectType;
    projectSettings.defines = data.defines;
    projectSettings.flagsASM = data.flagsASM;
    projectSettings.flagsC = data.flagsC;
    projectSettings.flagsCPP = data.flagsCPP;
    projectSettings.servertype = data.servertype;
    projectSettings.debugger = data.debugger;
  
    if (isCortexBuilderChanges){
      nCortexBuilder.Replace(isOpenOCDConfigChanges);
    }
    if (isLaunchChanges){
      nLaunch.Replace("swd", isOpenOCDConfigChanges).then(() => {
        //if (isTasksChanges){nTasks.Replace(projectSettings.core, projectSettings.jlinkTaskDevice);}
      });
    }
    if (isC_CPP_PropertiesChanges){
      nC_CPP_Properties.Replace(compilerPath);
    }
    if (isLinkerChanges){
      nLinker.Replace(projectSettings.ramStart, projectSettings.flashStart, projectSettings.ramEnd,
        projectSettings.ramSizeK, projectSettings.flashSizeK,
        projectSettings.heapSize, projectSettings.stackSize);
    }
    if (isStartupChanges){
      nStartupCreator.Replace(projectSettings.core, projectSettings.startupFPU, projectSettings.interrupts);
    }
    if (isMakeFileChanges){
      nMakefile.Replace(projectSettings.projectType, projectSettings.core, projectSettings.flashStart, 
        projectSettings.makefileFPU, projectSettings.makefileFLOATABI,
        projectSettings.standardC, projectSettings.standardCPP, projectSettings.optimization, projectSettings.defines,
        projectSettings.includesDir, projectSettings.sources, 
        projectSettings.flagsASM, projectSettings.flagsC, projectSettings.flagsCPP);
    }
    if (data.debugger === 'jlink'){nJLink.New();}
    else{ nJLink.Delete();}
    resolve();
  });
}

function DownloadNewFiles(name: string): Promise<nJsonController.Data>{
  return new Promise((resolve, reject) => {
    let isSVDDownloaded = false;
    let isIncludeDownloaded = false;
    let isDocumentationDownloaded = false;
    let _controller:nJsonController.Data;
    nDownload.GetController(name).then(controller =>{
      nDownload.GetSVD(controller.svd).then(() => {
        isSVDDownloaded = true;
        if (isIncludeDownloaded && isDocumentationDownloaded){ resolve(controller);}
      });
      nDownload.GetInclude(controller.include).then(() =>{
        isIncludeDownloaded = true;
        if (isSVDDownloaded && isDocumentationDownloaded){ resolve(controller);}
      });
      nDownload.GetDocumentation(controller.documentation).then(() =>{
        isDocumentationDownloaded = true;
        if (isSVDDownloaded && isIncludeDownloaded){ resolve(controller);}
      });
    }, () =>{
      reject(_controller);
    });
  });
}

function GetController(controllerName: string): nJsonController.Data{
    let controllerPath = path.join(nStartup.context.globalStoragePath, 'Controllers', controllerName, controllerName + '.json');
    let data = fs.readFileSync(controllerPath);
    return JSON.parse(data.toString());
}

function IsArraysMatch(arr1:string[], arr2:string[]):boolean{
  if (arr1.length !== arr2.length){return false;}
  for (let i = 0; i < arr1.length; ++i){
    let isMatch = false;
    for(let j = 0; j < arr2.length; ++j) {
      if (arr1[i] === arr2[j]){isMatch = true; break;}
    }
    if (!isMatch){return false;}
  }
  return true;
}