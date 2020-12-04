import * as vscode from 'vscode';
import * as path from 'path';
import * as nCreateVSCodeWorkspace from './Creator/VSCodeWorkspace';
import * as nC_CPP_Properties from './Creator/C_CPP_Properties';
import * as nLaunch from './Creator/Launch';
import * as nSettings from './Creator/Settings';
import * as nTasks from './Creator/Tasks';
import * as nJsonController from './JsonData/Controller';
import * as nMakefile from './Creator/Makefile';
import * as nLinker from './Creator/Linker';
import * as nStartup from './Creator/Startup';
import * as nNewProjectSource from './Creator/NewProjectSource';
import * as nCortexBuilder from './Creator/CortexBuilder';
import * as nTerminalCommands from './terminalCommands';
import * as nDownload from './download';
import * as nJLink from './Creator/JLink';
import {controllersList} from './startup';
import {projectSettings} from './Creator/CortexBuilder';


export function createNewProject1(){
  let controller:nJsonController.Data;
  let projectPath:Project;
  PickController().then(controllerName => {
    nDownload.GetController(controllerName).then(_controller => {
      nDownload.GetSVD(_controller.svd).then(() => {
        nDownload.GetCore().then(() =>{
          nDownload.GetInclude(_controller.include).then(() =>{
            controller = _controller;
            if (projectPath !== undefined){
              SaveNewProject(controller, projectPath);}
          });
        });
      });
    },);
    GetNewProjectPath().then(_projectPath => {
      projectPath = _projectPath;
      if (controller !== undefined){
        SaveNewProject(controller, projectPath);}
    });
  });
}

export function createNewProject(){
  let controller:nJsonController.Data;
  let projectPath:Project;
  let isSVDDownloaded = false;
  let isCoreDownloaded = false;
  let isIncludeDownloaded = false;
  let isPdfViewerDownloaded = false;
  let isDocumentationDownloaded = false;
  PickController().then(controllerName => {

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Preparing project",
      cancellable: false
    }, () => {
      return new Promise(resolve => {

        nDownload.GetController(controllerName).then(_controller => {
          controller = _controller;
          
          nDownload.GetSVD(_controller.svd).then(() => {
            isSVDDownloaded = true;
            if (projectPath !== undefined && isCoreDownloaded && isIncludeDownloaded && isPdfViewerDownloaded && isDocumentationDownloaded){
              SaveNewProject(controller, projectPath); resolve();}
          }, () =>{ resolve(); });
          
          nDownload.GetCore().then(() =>{
            isCoreDownloaded = true;
            if (projectPath !== undefined && isSVDDownloaded && isIncludeDownloaded && isPdfViewerDownloaded && isDocumentationDownloaded){
              SaveNewProject(controller, projectPath); resolve();}
          }, ()=> {resolve();});
          nDownload.GetInclude(_controller.include).then(() =>{
            isIncludeDownloaded = true;
            if (projectPath !== undefined && isSVDDownloaded && isCoreDownloaded && isPdfViewerDownloaded && isDocumentationDownloaded){
              SaveNewProject(controller, projectPath); resolve();}
          }, ()=> {resolve();});
          
          nDownload.GetPdfViewer().then(() =>{
            isPdfViewerDownloaded = true;
            if (projectPath !== undefined && isSVDDownloaded && isCoreDownloaded && isIncludeDownloaded && isDocumentationDownloaded){
              SaveNewProject(controller, projectPath); resolve();}
          }, ()=> {resolve();});
          
          nDownload.GetDocumentation(_controller.documentation).then(() =>{
            isDocumentationDownloaded = true;
            if (projectPath !== undefined && isSVDDownloaded && isCoreDownloaded && isIncludeDownloaded && isPdfViewerDownloaded){
              SaveNewProject(controller, projectPath); resolve();}
          }, ()=> {resolve();});
          
        });

        GetNewProjectPath().then(_projectPath => {
          projectPath = _projectPath;
          if (controller !== undefined && isSVDDownloaded && isCoreDownloaded && isIncludeDownloaded && isPdfViewerDownloaded && isDocumentationDownloaded){
            SaveNewProject(controller, projectPath); resolve();}
        }, ()=> {resolve();});

      });
    });
  });
}

function SaveNewProject(controller:nJsonController.Data, projectPath:Project) {
  nCortexBuilder.New(projectPath.directory, controller);
  nNewProjectSource.New(projectPath.name, projectPath.directory);
  nLinker.New(projectPath.directory, controller);
  nLaunch.New(projectPath.directory, controller);
  nSettings.New(projectPath.directory, controller);
  nTasks.New(projectPath.directory, controller);
  nMakefile.New(projectPath.directory, controller);
  nStartup.New(projectPath.directory, controller);
  nC_CPP_Properties.New(projectPath.directory, controller.include, [controller.define]);
  if (projectSettings.debugger === 'jlink'){
    nJLink.New(projectPath.name, projectPath.directory);
  }
  nCreateVSCodeWorkspace.New(projectPath.directory, controller).then(() =>{

    let open = 'Open';
    let openNclose = 'Open and close current';
    let text = 'Open New Project?';
    vscode.window.showInformationMessage(text, open, openNclose).then(selection => {
      if (selection === undefined){return;}
      nTerminalCommands.OpenProject(projectPath.directory, projectPath.name).then(value =>{
        if (selection === openNclose) {
        setTimeout(() => vscode.commands.executeCommand("workbench.action.closeWindow"), 5000);}
      });
    });
    
  });
}

function PickController(): Promise<string>{
  return new Promise((resolve, reject) => {
    let QuickPickOptions:vscode.QuickPickOptions = {
      placeHolder: "Select controller",
      matchOnDetail: true,
      matchOnDescription: true
    };
    vscode.window.showQuickPick(controllersList, QuickPickOptions).then(value =>{
      if (value !== undefined){
        resolve(value.label);
      } else {
        reject();
      }
    });
  });
}

function GetNewProjectPath(): Promise<Project>{
  return new Promise((resolve, reject) => {
		let SaveDialogOptions: vscode.SaveDialogOptions = {
			saveLabel: "Create Project",
			filters:{
				VSWorkspace: ['code-workspace'],
		  }};
    vscode.window.showSaveDialog(SaveDialogOptions).then(fileInfos =>{
      if (fileInfos !== undefined) {
        let name = path.parse(fileInfos.fsPath).name;
        let dir = path.join(path.parse(fileInfos.fsPath).dir, name);
        let newProject:Project = {"name":name, "directory": dir};
        resolve(newProject);
      }
      reject();
    });
  });
}

interface Project{
  directory: string;
  name: string;
}