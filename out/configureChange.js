"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
export function HandlePropertyChange(event: vscode.ConfigurationChangeEvent){

  if (vscode.workspace.workspaceFolders === undefined){return;}
  let wsFolder = vscode.workspace.workspaceFolders[0];
  if (IsProjectSettingsControllerName(event, wsFolder)){return;}
  if (IsProjectSettingsFlashStart(event, wsFolder)){return;}
  if (IsProjectSettingsStackSize(event, wsFolder)){return;}
  if (IsProjectSettingsHeapSize(event, wsFolder)){return;}
  if (IsProjectSettingsAsmFlags(event, wsFolder)){return;}
  if (IsProjectSettingsCFlags(event, wsFolder)){return;}
  if (IsProjectSettingsCPPFlags(event, wsFolder)){return;}
  if (IsProjectSettingsCStandard(event, wsFolder)){return;}
  if (IsProjectSettingsCPPStandard(event, wsFolder)){return;}
  if (IsProjectSettingsOptimization(event, wsFolder)){return;}
  if (IsProjectSettingsDefines(event, wsFolder)){return;}
}
*/
/*
function IsProjectSettingsControllerName(event: vscode.ConfigurationChangeEvent,
                                         folder: vscode.WorkspaceFolder):boolean{
                                          if(!event.affectsConfiguration("uconstructor.ProjectSettings.Controller.1.Name", folder)){return false;}
  let newControllerName = vscode.workspace.getConfiguration("uconstructor.ProjectSettings.Controller.1", folder).get<string>("Name");
  if (newControllerName === undefined){return true;}
  newControllerName = newControllerName.toLowerCase();
  controllersList.forEach(controller =>{
    if(controller.label === newControllerName){
      nuConstructor.Get().then(projectSettings => {
        if (projectSettings.controller === newControllerName || newControllerName === undefined){return true;}
        //update
        {
          let prevControllerName = projectSettings.controller;
          projectSettings.controller = newControllerName;
          GetController(prevControllerName).then(prevController =>{
            GetController(projectSettings.controller).then(newController => {
              prevController.defaultSources.forEach(src =>{
                const index = projectSettings.sources.indexOf(src);
                if (index > -1){projectSettings.sources.splice(index,1);}
              });

              prevController.defaultIncludes.forEach(incDir =>{
                const index = projectSettings.includesDir.indexOf(incDir);
                if (index > -1){projectSettings.includesDir.splice(index,1);}
                projectSettings.includes.forEach(inc => {
                  if (path.dirname(inc) === incDir){projectSettings.includes.splice(projectSettings.includes.indexOf(inc),1);}
                });
              });

              
              prevController.defines.forEach(def =>{
                const index = projectSettings.defines.indexOf(def);
                if (index > -1){projectSettings.defines.splice(index,1);}
              });

              newController.heapSize = projectSettings.heapSize;
              newController.stackSize = projectSettings.stackSize;
              newController.flashStart = projectSettings.flashStart;

              projectSettings.includesDir.forEach(inc =>{newController.defaultIncludes.push(inc);});
              projectSettings.sources.forEach(src => {newController.defaultSources.push(src);});
              projectSettings.defines.forEach(define => {newController.defines.push(define);});
              projectSettings.defines = newController.defines;

              let flags:nMakefile.Flags = {
                asmFlags: projectSettings.flagsASM,
                cFlags: projectSettings.flagsC,
                cppFlags: projectSettings.flagsCPP
              };
              nuConstructor.Replace(projectSettings);
              //launch
              if (newController.core !== prevController.core){nLaunch.New(undefined, newController);}
              nTasks.New(undefined, newController);
              //nStartup.New(undefined,newController);
              //nLinker.New(undefined, newController);
              //nMakefile.New(undefined, newController, flags);
              nC_CPP_Properties.New(undefined, newController.defaultIncludes, newController.defines);
              nVSCodeWorkspace.ChangeDefines(newController.defines);
            });
          });
        }
      });
      return true;
    }
  });
  return true;
}

function IsProjectSettingsFlashStart(event: vscode.ConfigurationChangeEvent,
                                     folder: vscode.WorkspaceFolder):boolean{
  if(!event.affectsConfiguration("uconstructor.ProjectSettings.Controller.2.FlashStart", folder)){return false;}
  let newFlashStart = vscode.workspace.getConfiguration("uconstructor.ProjectSettings.Controller.2", folder).get<string>("FlashStart");
  if (newFlashStart === undefined){return true;}
  nuConstructor.ChangeFlashStart(newFlashStart);
  nLinker.ChangeFlashStart(newFlashStart);
  return true;
}

function IsProjectSettingsStackSize(event: vscode.ConfigurationChangeEvent,
                                    folder: vscode.WorkspaceFolder):boolean{
  if(!event.affectsConfiguration("uconstructor.ProjectSettings.Controller.3.StackSize", folder)){return false;}
  let stackSize = vscode.workspace.getConfiguration("uconstructor.ProjectSettings.Controller.3", folder).get<string>("StackSize");
  if (stackSize === undefined){return true;}
  nuConstructor.ChangeStackSize(stackSize);
  nLinker.ChangeStackSize(stackSize);
  return true;
}

function IsProjectSettingsHeapSize(event: vscode.ConfigurationChangeEvent,
                                   folder: vscode.WorkspaceFolder):boolean{
  if(!event.affectsConfiguration("uconstructor.ProjectSettings.Controller.4.HeapSize", folder)){return false;}
  let heapSize = vscode.workspace.getConfiguration("uconstructor.ProjectSettings.Controller.4", folder).get<string>("HeapSize");
  if (heapSize === undefined){return true;}
  nuConstructor.ChangeHeapSize(heapSize);
  nLinker.ChangeHeapSize(heapSize);
  return true;
}

function IsProjectSettingsAsmFlags(event: vscode.ConfigurationChangeEvent,
                                   folder: vscode.WorkspaceFolder):boolean{
  if(!event.affectsConfiguration("uconstructor.ProjectSettings.Flags.3.ASM", folder)){return false;}
  let asmFlags = vscode.workspace.getConfiguration("uconstructor.ProjectSettings.Flags.3").get<string[]>("ASM");
  if (asmFlags === undefined){return true;}
  nuConstructor.ChangeAsmFlags(asmFlags);
  nMakefile.ChangeAsmFlags(asmFlags);
  return true;
}

function IsProjectSettingsCFlags(event: vscode.ConfigurationChangeEvent,
  folder: vscode.WorkspaceFolder):boolean{
  if(!event.affectsConfiguration("uconstructor.ProjectSettings.Flags.2.C", folder)){return false;}
  let cFlags = vscode.workspace.getConfiguration("uconstructor.ProjectSettings.Flags.2").get<string[]>("C");
  if (cFlags === undefined){return true;}
  nuConstructor.ChangeCFlags(cFlags);
  nMakefile.ChangeCFlags(cFlags);
  return true;
}

function IsProjectSettingsCPPFlags(event: vscode.ConfigurationChangeEvent,
  folder: vscode.WorkspaceFolder):boolean{
  if(!event.affectsConfiguration("uconstructor.ProjectSettings.Flags.1.CPP", folder)){return false;}
  let cppFlags = vscode.workspace.getConfiguration("uconstructor.ProjectSettings.Flags.1").get<string[]>("CPP");
  if (cppFlags === undefined){return true;}
  nuConstructor.ChangeCPPFlags(cppFlags);
  nMakefile.ChangeCPPFlags(cppFlags);
  return true;
}

function IsProjectSettingsCStandard(event: vscode.ConfigurationChangeEvent,
  folder: vscode.WorkspaceFolder):boolean{
  if(!event.affectsConfiguration("uconstructor.ProjectSettings.Project.2.StandardC", folder)){return false;}
  let standardC = vscode.workspace.getConfiguration("uconstructor.ProjectSettings.Project.2").get<string>("StandardC");
  if (standardC === undefined){return true;}
  nC_CPP_Properties.ChangeCStandard(standardC);
  nMakefile.ChangeCStandard(standardC);
  return true;
}

function IsProjectSettingsCPPStandard(event: vscode.ConfigurationChangeEvent,
  folder: vscode.WorkspaceFolder):boolean{
  if(!event.affectsConfiguration("uconstructor.ProjectSettings.Project.1.StandardCPP", folder)){return false;}
  let standardCPP = vscode.workspace.getConfiguration("uconstructor.ProjectSettings.Project.1").get<string>("StandardCPP");
  if (standardCPP === undefined){return true;}
  nC_CPP_Properties.ChangeCPPStandard(standardCPP);
  nMakefile.ChangeCPPStandard(standardCPP);
  return true;
}

function IsProjectSettingsOptimization(event: vscode.ConfigurationChangeEvent,
  folder: vscode.WorkspaceFolder):boolean{
  if(!event.affectsConfiguration("uconstructor.ProjectSettings.Project.3.Optimization", folder)){return false;}
  let optimization = vscode.workspace.getConfiguration("uconstructor.ProjectSettings.Project.3").get<string>("Optimization");
  if (optimization === undefined){return true;}
  nMakefile.ChangeOptimization(optimization);
  return true;
}

function IsProjectSettingsDefines(event: vscode.ConfigurationChangeEvent,
  folder: vscode.WorkspaceFolder):boolean{
  if(!event.affectsConfiguration("uconstructor.ProjectSettings.Project.4.Defines", folder)){return false;}
  let defines = vscode.workspace.getConfiguration("uconstructor.ProjectSettings.Project.4").get<string[]>("Defines");
  if (defines === undefined){return true;}
  nC_CPP_Properties.UpdateDefines(defines);
  nuConstructor.UpdateDefines(defines);
  return true;
}

function GetController(controllerName: string): Promise<nJsonController.Data>{
  return new Promise((resolve, reject) => {
    let path = require('path');
    path = path.resolve(__dirname, '..') + "/resources/Json/Controllers/" + controllerName + ".json";
    fs.readFile(path, (err, data) => {
      if(data !== undefined){
        let controller:nJsonController.Data = JSON.parse(data.toString());
        resolve(controller);
      }
    });
  });
}
*/ 
//# sourceMappingURL=configureChange.js.map