import * as vscode from 'vscode';
import * as nNewProject from './createNewProject';
import * as nStartup from './startup';
import * as nTerminalCommands from './terminalCommands';
import * as nSettings from './settings';
import { PdfProvider } from './pdfProvider';

export function activate(context: vscode.ExtensionContext) {

  nStartup.exec(context);

  let build = vscode.commands.registerCommand('task.build', ()=>{
    nTerminalCommands.Build();
  });

  let clean = vscode.commands.registerCommand('task.clean', ()=>{
    nTerminalCommands.Clean();
  });

  let flash = vscode.commands.registerCommand('task.flash', ()=>{
    nTerminalCommands.Flash();
  });

  let erase = vscode.commands.registerCommand('task.erase', ()=>{
    nTerminalCommands.Erase();
  });

  let reset = vscode.commands.registerCommand('task.reset', ()=>{
    nTerminalCommands.Reset();
  });

  let debug = vscode.commands.registerCommand('task.debug', ()=>{
    nTerminalCommands.Debug();
  });

  let settings = vscode.commands.registerCommand('task.settings', ()=>{
    nSettings.Show();
  });

  let newProject = vscode.commands.registerCommand('task.newProject', ()=>{
    nNewProject.createNewProject();
  });

  let expand = vscode.commands.registerCommand('task.expand', ()=>{
    vscode.commands.executeCommand('setContext', 'isBarExpanded', true);
  });

  let collapse = vscode.commands.registerCommand('task.collapse', ()=>{
    vscode.commands.executeCommand('setContext', 'isBarExpanded', false);
  });

  context.subscriptions.push(build);
  context.subscriptions.push(clean);
  context.subscriptions.push(flash);
  context.subscriptions.push(erase);
  context.subscriptions.push(reset);
  context.subscriptions.push(debug);
  context.subscriptions.push(settings);
  context.subscriptions.push(newProject);
  context.subscriptions.push(expand);
  context.subscriptions.push(collapse);
}

export function deactivate() {};
