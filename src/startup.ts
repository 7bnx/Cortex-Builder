import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as nCortexBuilder from './Creator/CortexBuilder';
import * as nJsonControllerList from './JsonData/ControllersList';
import * as nSettings from './settings';
import * as nDownload from './download';
import { PdfProvider } from './pdfProvider';
import {CortexBuilderProvider} from './cortexbuilderProvider';
import {projectSettings} from './Creator/CortexBuilder';

export var controllersList:nJsonControllerList.Data[];

export var context: vscode.ExtensionContext;

export var cortexBuilderProvider:CortexBuilderProvider;

export var pdfProvider:PdfProvider;

export function exec(_context: vscode.ExtensionContext){
  context = _context;

  cortexBuilderProvider = new CortexBuilderProvider(context);
  vscode.window.createTreeView('cortexBuilderProvider', {
    treeDataProvider: cortexBuilderProvider
  });

  nDownload.GetControllerList().then(list => {
    vscode.commands.executeCommand('setContext', 'isControllersListReceived', true);
    vscode.commands.executeCommand('setContext', 'isBarExpanded', true);
    controllersList = list;
    let settingsPath =  vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath: '';
    if (settingsPath === undefined){return;}
    settingsPath = path.join(settingsPath, '.vscode', 'cortexbuilder.json');
    if (fs.existsSync(settingsPath)){
      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Preparing project",
        cancellable: false
      }, () => {
        const promise = new Promise(resolve => {

          vscode.commands.executeCommand('setContext', 'isProjectOpened', true);
          nCortexBuilder.Get().then(() =>{ // First load settings from file
            if (projectSettings.isFirstLaunch === true){
              let text = 'Open Settings?';
              vscode.window.showInformationMessage(text, 'Yes', 'No').then( selecion =>{
                if (selecion === 'Yes'){setTimeout(() => nSettings.Show(), 1000);}
              });
              projectSettings.isFirstLaunch = false;
              nCortexBuilder.Replace();
            }
            let documentation = projectSettings.documentation ? projectSettings.documentation : [];
            cortexBuilderProvider.PushItems({includes: projectSettings.includes, 
              includesDir: projectSettings.includesDir, 
              sources: projectSettings.sources}, projectSettings.deviceInc, documentation);
            resolve();
          });
    
          pdfProvider = new PdfProvider(_context);
        });
  
        return promise;
      });
    }
  });
}