import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as nCortexBuilder from './Creator/CortexBuilder';
import * as nJsonControllerList from './JsonData/ControllersList';
import * as nWebView from './webView';
import * as nDownload from './download';
import {TreeViewProvider} from './TreeViewProvider';

export var controllersList:nJsonControllerList.Data[];

export var context: vscode.ExtensionContext;

export var treeViewProvider:TreeViewProvider;

export function exec(_context: vscode.ExtensionContext){
  context = _context;

  treeViewProvider = new TreeViewProvider(context);
  vscode.window.createTreeView('treeViewProvider', {
    treeDataProvider: treeViewProvider
  });

  nDownload.GetControllerList().then(list => {
    vscode.commands.executeCommand('setContext', 'isControllersListReceived', true);
    vscode.commands.executeCommand('setContext', 'isBarExpanded', true);
    controllersList = list;
    let settingsPath = vscode.workspace.rootPath;
    if (settingsPath === undefined){return;}
    settingsPath = path.join(settingsPath, '.vscode', 'cortexbuilder.json');
    if (fs.existsSync(settingsPath)){
      vscode.commands.executeCommand('setContext', 'isProjectOpened', true);
      nCortexBuilder.Get().then(projectSettings =>{
        if (projectSettings.isFirstLaunch === true){
          let text = 'Open Settings?';
          vscode.window.showInformationMessage(text, 'Yes', 'No').then( selecion =>{
            if (selecion === 'Yes'){setTimeout(() => nWebView.Show(), 1000);}
          });
          projectSettings.isFirstLaunch = false;
          nCortexBuilder.Replace();
        }
        treeViewProvider.PushItems({includes: projectSettings.includes, 
          includesDir: projectSettings.includesDir, 
          sources: projectSettings.sources}, projectSettings.deviceInc);
      });
    }
  });
}