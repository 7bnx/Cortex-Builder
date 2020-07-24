import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import * as http from 'http';
import * as https from 'https';
import * as nJsonController from './JsonData/Controller';
import * as nJsonUpdate from './JsonData/Update';
import * as nJsonControllerList from './JsonData/ControllersList';
import {context} from './startup';


const urlControllersList:string = 'https://raw.githubusercontent.com/7bnx/Cortex-Builder-Essentials/master/Controllers/ControllersList.json';
const urlControllersListUpdate:string = 'https://raw.githubusercontent.com/7bnx/Cortex-Builder-Essentials/master/Controllers/Update.json';
const urlControllerPath = 'https://raw.githubusercontent.com/7bnx/Cortex-Builder-Essentials/master/Controllers';
const urlSVDPath = 'https://raw.githubusercontent.com/7bnx/Cortex-Builder-Essentials/master/SVD';
const urlCorePath = 'https://raw.githubusercontent.com/7bnx/Cortex-Builder-Essentials/master/Core';
const urlIncludePath = 'https://raw.githubusercontent.com/7bnx/Cortex-Builder-Essentials/master/Include';
const coreFiles:string[] = ["cachel1_armv7.h", "cmsis_armcc.h", "cmsis_armclang.h", "cmsis_armclang_ltm.h",
                            "cmsis_compiler.h", "cmsis_gcc.h", "cmsis_iccarm.h", "cmsis_version.h", "core_cm0.h", 
                            "core_cm0plus.h", "core_cm1.h", "core_cm3.h", "core_cm4.h", "core_cm7.h", "mpu_armv7.h"];

const timeout = 10000;

export function File(fileURL:string): Promise<string>{
  return new Promise((resolve, reject) => {
    const  urlParsed = url.parse(fileURL);
    let protocol = (urlParsed.protocol === 'https:') ? https : http;
    let request = protocol.get(fileURL, function(response) {

      if (response.statusCode === 200) {

      } else {
        resolve('');
      }

      let raw:string = '';
      let isNotResponse = false;
      response.on('data', (chunk) => {
        if(response.statusCode === 200){
          raw += chunk;
        }else{
          isNotResponse = true;
        }
      });

      response.on('error', (err) => {
        resolve('');
      });

      response.on('end', () =>{
        if (isNotResponse === true){raw = '';}
        resolve(raw);
      });
    });

    request.setTimeout(timeout, function () {
      request.abort();
      resolve('');
    });
    request.on('error', (err) => {
      resolve('');
    });
  });
}

export function GetController(controllerName:string): Promise<nJsonController.Data>{
  return new Promise((resolve, reject) => {
    let controllerPath: string = path.join(context.globalStoragePath, 'Controllers', controllerName);
    let controllerPathProp = path.join(controllerPath, controllerName + '.json');
    let controllerPathUpdate = path.join(controllerPath, 'Update.json');
    let controllerUpdate:nJsonUpdate.Data = {date: 0};
    let controller:nJsonController.Data;
    if (fs.existsSync(controllerPathUpdate)){
      let file = fs.readFileSync(controllerPathUpdate);
      try {controllerUpdate = JSON.parse(file.toString());} 
      catch (e){ }
      if (fs.existsSync(controllerPathProp)){
        file = fs.readFileSync(controllerPathProp);
        try {controller = JSON.parse(file.toString());} 
        catch (e){ }
      }
    }
    File(path.join(urlControllerPath, controllerName, 'Update.json')).then(data =>{
      let controllerUpdateDownloaded:nJsonUpdate.Data = {date: 0};
      try { controllerUpdateDownloaded = JSON.parse(data);}
      catch (e) {}
      if (data !== '' && nJsonUpdate.Is(controllerUpdateDownloaded) && controllerUpdateDownloaded.date > controllerUpdate.date){
        File(path.join(urlControllerPath, controllerName, controllerName + '.json')).then(data =>{
          try {controller = JSON.parse(data.toString());} 
          catch (e){ }
          if (data !== '' && nJsonController.Is(controller)){
            if (!fs.existsSync(controllerPath)){fs.mkdirSync(controllerPath);}
            fs.writeFileSync(controllerPathProp, JSON.stringify(controller, null, "\t"), {mode:0o444});
            fs.writeFileSync(controllerPathUpdate, JSON.stringify(controllerUpdateDownloaded, null, "\t"), {mode:0o444});
            resolve(controller);
          } else {
            reject();
          }
        });
      } else {
        if (controller === undefined){
          vscode.window.showErrorMessage("Can't download " + controllerName + " from repo");
          reject();
        }
        resolve(controller);
      }
    });
  });
}

export function GetSVD(name:string): Promise<void>{
  return new Promise((resolve, reject) => {
    let svdPath: string = path.join(context.globalStoragePath, 'SVD', name);
    let svdPathFile = path.join(svdPath, name + '.svd');
    let svdPathUpdate = path.join(svdPath, 'Update.json');
    let svdUpdate:nJsonUpdate.Data = {date: 0};
    let isSVDExists = false;
    if (fs.existsSync(svdPathUpdate)){
      let file = fs.readFileSync(svdPathUpdate);
      try {svdUpdate = JSON.parse(file.toString());} 
      catch (e){ }
      if (fs.existsSync(svdPathFile)){
        isSVDExists = true;
      }
    }
    File(path.join(urlSVDPath, name, 'Update.json')).then(data =>{
      let svdUpdateDownloaded:nJsonUpdate.Data = {date: 0};
      try { svdUpdateDownloaded = JSON.parse(data);}
      catch (e) {}
      if (data !== '' && nJsonUpdate.Is(svdUpdateDownloaded) && svdUpdateDownloaded.date > svdUpdate.date){
        File(path.join(urlSVDPath, name, name + '.svd')).then(svd =>{
          if (svd !== ''){
            if (!fs.existsSync(svdPath)){fs.mkdirSync(svdPath);}
            fs.writeFile(svdPathFile, svd, {mode:0o444}, () =>{});
            fs.writeFile(svdPathUpdate, JSON.stringify(svdUpdateDownloaded, null, "\t"), {mode:0o444}, () =>{});
            resolve();
          } else {
            vscode.window.showErrorMessage("Can't download " + name + ".svd from repo");
            reject();
          }
        });
      } else {
        if (svdUpdate.date > 0 && isSVDExists){ resolve();}
        else {
          vscode.window.showErrorMessage("Can't get " + name + ".svd from repo");
          reject();
        }
      }
    });
  });
}

export function GetCore(): Promise<void>{
  return new Promise((resolve, reject) => {
    const corePath: string = path.join(context.globalStoragePath, 'Core');
    const corePathUpdate = path.join(corePath, 'Update.json');
    let coreUpdate:nJsonUpdate.Data = {date: 0};
    let coreFilesCount = 0;
    if(fs.existsSync(corePathUpdate)){
      let file = fs.readFileSync(corePathUpdate);
      try {coreUpdate = JSON.parse(file.toString());} 
      catch (e){ }
      coreFiles.forEach(file => {
        if(fs.existsSync(path.join(corePath, file))){coreFilesCount++;}
      });
    } else {fs.mkdirSync(corePath);}
    File(path.join(urlCorePath, 'Update.json')).then(coreUpdateData =>{
      let coreUpdateDownloaded:nJsonUpdate.Data = {date: 0};
      try { coreUpdateDownloaded = JSON.parse(coreUpdateData);}
      catch (e) {}
      if ((coreUpdateData !== '' && nJsonUpdate.Is(coreUpdateDownloaded) && coreUpdateDownloaded.date > coreUpdate.date ) || coreFilesCount < coreFiles.length - 1){
        coreFiles.forEach((file, index) => {
          File(path.join(urlCorePath, file)).then(data => {
            fs.writeFile(path.join(corePath, file), data, {mode:0o444}, () => {
              if (index >= coreFiles.length - 1){
                fs.writeFile(corePathUpdate, JSON.stringify(coreUpdateDownloaded, null, "\t"), {mode:0o444}, () =>{});
                resolve();
              }
            });
          });
        });
      } else if (coreFilesCount >= coreFiles.length - 1){
        resolve();
      } else {
        vscode.window.showErrorMessage("Can't get core files");
        reject();
      }
    });
  });}

export function GetInclude(include:string): Promise<void>{
  return new Promise((resolve, reject) => {
    const includePath: string = path.join(context.globalStoragePath, 'Include', include);
    const includePathUpdate = path.join(includePath, 'Update.json');
    let coreUpdate:nJsonUpdate.Data = {date: 0};
    let isHeaderExists = false;
    if(fs.existsSync(includePath)){
      if (fs.existsSync(includePathUpdate)){
        let file = fs.readFileSync(includePathUpdate);
        try {coreUpdate = JSON.parse(file.toString());} 
        catch (e){ }
        if (fs.existsSync(path.join(includePath, include + '.h'))){isHeaderExists = true;}
      }
    } else {fs.mkdirSync(includePath, {recursive: true});}
    File(path.join(urlIncludePath, include, 'Update.json')).then(coreUpdateData =>{
      let includeUpdateDownloaded:nJsonUpdate.Data = {date: 0};
      try { includeUpdateDownloaded = JSON.parse(coreUpdateData);}
      catch (e) {}
      if ((coreUpdateData !== '' && nJsonUpdate.Is(includeUpdateDownloaded) && includeUpdateDownloaded.date > coreUpdate.date || isHeaderExists === false)){
        File(path.join(urlIncludePath, include, include + '.h')).then(header =>{
          if (header !== ''){
            fs.writeFile(path.join(includePath, include +'.h'), header, {mode:0o444}, () =>{});
            fs.writeFile(includePathUpdate, JSON.stringify(includeUpdateDownloaded, null, "\t"), {mode:0o444}, () =>{});
            resolve();
          } else {
            vscode.window.showErrorMessage("Can't download " + include + ".h from repo");
            reject();
          }
        });
      }else{
        if (isHeaderExists){resolve();}
        else{
          vscode.window.showErrorMessage("Can't get " + include + ".h from repo");
          reject();
        }
      }   
    });
  });
}

export function GetControllerList(): Promise<nJsonControllerList.Data[]>{
  return new Promise((resolve, reject) => {
    const pathControllersList:string = path.join(context.globalStoragePath, 'Controllers', 'ControllersList.json');
    const pathControllersListUpdate:string = path.join(context.globalStoragePath, 'Controllers', 'Update.json');
    if (!fs.existsSync(context.globalStoragePath)){
      fs.mkdirSync(context.globalStoragePath);
    };
    if (!fs.existsSync(path.join(context.globalStoragePath, 'Controllers'))){
      fs.mkdirSync(path.join(context.globalStoragePath, 'Controllers'));
    };
    if (!fs.existsSync(path.join(context.globalStoragePath, 'SVD'))){
      fs.mkdirSync(path.join(context.globalStoragePath, 'SVD'));
    };
    let clUpdateJson:nJsonUpdate.Data = {date: 0};
    let clJson:nJsonControllerList.Data[] = [{label:'', description:''}];
    if (fs.existsSync(pathControllersListUpdate)){
      let file = fs.readFileSync(pathControllersListUpdate);
      try {clUpdateJson = JSON.parse(file.toString());} 
      catch (e){ }
      file = fs.readFileSync(pathControllersList);
      if (fs.existsSync(pathControllersList)){
        file = fs.readFileSync(pathControllersList);
        try {clJson = JSON.parse(file.toString());}
        catch{}
      }else {clUpdateJson.date = 0;}
    }

    File(urlControllersListUpdate).then(clUpdateDownloaded => {
      let clUpdateJsonDownloaded:nJsonUpdate.Data = {date:0};
      try {clUpdateJsonDownloaded = JSON.parse(clUpdateDownloaded);} 
      catch (e){ }
      if (nJsonUpdate.Is(clUpdateJsonDownloaded) && clUpdateJsonDownloaded.date > clUpdateJson.date){
        File(urlControllersList).then(clDownloaded =>{
          let tmp:nJsonControllerList.Data[] = [{label:'', description:''}];
          try {tmp = JSON.parse(clDownloaded);} 
          catch (e){ }
          if (nJsonControllerList.Is(tmp[0]) && clDownloaded !== ''){
            clJson = tmp;
            fs.writeFile(pathControllersList, JSON.stringify(clJson, null, "\t"), () =>{});
            fs.writeFile(pathControllersListUpdate, JSON.stringify(clUpdateJsonDownloaded, null, "\t"), () =>{});
          }
          //Error Download Handler!!!
          resolve(clJson);
        });
      } else{
        //Error Local Handler!!!
        resolve(clJson);
      }
    });
  });
}
