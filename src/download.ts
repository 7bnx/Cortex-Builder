import * as vscode from 'vscode';
import * as path from 'path';
import * as dns from 'dns';
import * as fs from 'fs';
import * as url from 'url';
import * as http from 'http';
import * as https from 'https';
import * as nJsonController from './JsonData/Controller';
import * as nJsonUpdate from './JsonData/Update';
import * as nJsonControllerList from './JsonData/ControllersList';
import * as nJsonPdfJS from './JsonData/PdfJSFiles';
import {context} from './startup';


const urlControllers = 'https://raw.githubusercontent.com/7bnx/Cortex-Builder-Essentials/master/Controllers';
const urlSVD = 'https://raw.githubusercontent.com/7bnx/Cortex-Builder-Essentials/master/SVD';
const urlCore = 'https://raw.githubusercontent.com/7bnx/Cortex-Builder-Essentials/master/Core';
const urlInclude = 'https://raw.githubusercontent.com/7bnx/Cortex-Builder-Essentials/master/Include';
const urlDocumentation = 'https://raw.githubusercontent.com/7bnx/Cortex-Builder-Essentials/master/Documentation';
const urlPdfViewer = 'https://raw.githubusercontent.com/7bnx/Cortex-Builder-Essentials/master/PdfViewer';
const coreFiles:string[] = ["cachel1_armv7.h", "cmsis_armcc.h", "cmsis_armclang.h", "cmsis_armclang_ltm.h",
                            "cmsis_compiler.h", "cmsis_gcc.h", "cmsis_iccarm.h", "cmsis_version.h", "core_cm0.h", 
                            "core_cm0plus.h", "core_cm1.h", "core_cm3.h", "core_cm4.h", "core_cm7.h", "mpu_armv7.h"];

const timeout = 120000;

export function GetController(controller:string): Promise<nJsonController.Data>{

  return new Promise((resolve, reject) => {
    const local = path.join(context.globalStoragePath, 'Controllers', controller);
    const name = controller +'.json';
    const url = path.join(urlControllers, controller);
    GetSingleFile(url, local, name).then(() =>{
      GetLocalJson<nJsonController.Data>(path.join(local, name)).then((controller)=> {
        resolve(controller);
      }, ()=>{
        reject();
      });
    }, () =>{
      reject();
    });
  });
}

export function GetSVD(svd: string): Promise<void>{
  return new Promise((resolve, reject) => {
    const local = path.join(context.globalStoragePath, 'SVD', svd);
    const name = svd +'.svd';
    const url = path.join(urlSVD, svd);
    GetSingleFile(url, local, name).then(() =>{
      resolve();
    }, () =>{
      reject();
    });
  });
}

function GetSingleFile(url: string, local: string, name: string): Promise<string>{
  return new Promise((resolve, reject) => {

    const localUpdate = path.join(local, "Update.json");
    const localFull = path.join(local, name);
    CheckUpdate(url, local).then((update) => {
        fs.chmod(localFull, 0o666, (err)=>{
          fs.chmod(localUpdate, 0o666, (err)=>{
            DownloadAndWriteFiles([name], url, local).then((raw) =>{
              fs.writeFile(localUpdate, JSON.stringify(update, null, "\t"), {mode:0o444},err => {
                if (err){vscode.window.showErrorMessage("Write Error 'Update.json' in " + local); reject();}
                resolve(raw);
              });
            }, (err) =>{
              // Error while loading include files
              reject();
            });
          });
        });
      }, () =>{
        resolve('');
        // Up to date / no connection
      });
  });
}

export function GetCore(): Promise<void>{

  return new Promise((resolve, reject) => {
    const localCore = path.join(context.globalStoragePath, 'Core');
    const localUpdate = path.join(localCore, "Update.json");
      CheckUpdate(urlCore, localCore).then((update) => {
          fs.rmdir(localCore, {recursive: true}, (err) => {
            DownloadAndWriteFiles(coreFiles, urlCore, localCore).then(() =>{
              fs.writeFile(localUpdate, JSON.stringify(update, null, "\t"), {mode:0o444},err => {
                if (err){vscode.window.showErrorMessage("Write Error 'Update.json' in Core"); reject();}
                resolve();
              });
            }, () =>{
              // Error while loading core files
              reject();
            });
          });
      }, () =>{
        resolve();
        // Up to date / no connection
      });
  });
}

export function GetInclude(include: string): Promise<void>{

  return new Promise((resolve, reject) => {

    const local = path.join(context.globalStoragePath, 'Include', include);
    const name = include +'.h';
    const url = path.join(urlInclude, include);
    GetSingleFile(url, local, name).then(() =>{
      resolve();
    }, () =>{
      reject();
    });
  });
}

export function GetControllerList(): Promise<nJsonControllerList.Data[]>{

  return new Promise((resolve, reject) => {

    const local = path.join(context.globalStoragePath, 'Controllers');
    const name = 'ControllersList.json';
    GetSingleFile(urlControllers, local, name).then(() =>{
      GetLocalJson<nJsonControllerList.Data[]>(path.join(local, name)).then((list)=> {
        resolve(list);
      }, ()=>{
        reject();
      });
    }, () =>{
      reject();
    });
  });
}

export function GetPdfViewer(): Promise<void>{
  return new Promise((resolve, reject) => {
    const localPdfViewer = path.join(context.globalStoragePath, 'PdfViewer');
    const localUpdate = path.join(localPdfViewer, "Update.json");
    CheckUpdate(urlPdfViewer, localPdfViewer).then((update) => {
      File(path.join(urlPdfViewer, 'Files.json')).then(raw =>{
        let list:nJsonPdfJS.Data = {files: []};
        try { list = JSON.parse(raw);}
        catch (e) {vscode.window.showErrorMessage("Error downloading PdfViewer files"); reject();}
        fs.rmdir(localPdfViewer, {recursive: true}, (err) => {
          list.files.forEach((file, index) =>{
            let url = path.join(urlPdfViewer, file);
            let local = path.join(localPdfViewer, file);
            DownloadPDF(url, local).then(() =>{
              if (index >= list.files.length - 1){
                fs.chmod(localUpdate, 0o666, (err)=>{
                  fs.writeFile(localUpdate, JSON.stringify(update, null, "\t"), {mode:0o444}, (err) =>{
                    if (err){ vscode.window.showErrorMessage("Write Error 'Update.json' in PDF Viewer"); reject();}
                    resolve();
                  });
                });
              }
            }, ()=> {
              // Fail to download
              reject();
            });
          });
        });
      }, () => {
        reject();
        // Error, while loading list of files
      });
    }, () =>{
      resolve();
      // Up to date / no connection
    });
  });
}

export function GetDocumentation(documentation: string[]): Promise<void>{
  return new Promise((resolve, reject) => {
    if(!documentation || documentation.length === 0){ resolve();}
    documentation.forEach((doc, index) =>{
      let name = path.basename(doc) + '.pdf';
      let url = path.join(urlDocumentation, doc);
      let local = path.join(context.globalStoragePath, 'Documentation', doc);
      let localUpdate = path.join(local, 'Update.json');
      CheckUpdate(url, local).then((update) =>{
        DownloadPDF(path.join(url, name), path.join(local, name)).then(() =>{
          fs.chmod(localUpdate, 0o666, (err)=>{
            fs.writeFile(localUpdate, JSON.stringify(update, null, "\t"), {mode:0o444}, (err) =>{
              if (err){ vscode.window.showErrorMessage("Write Error 'Update.json' in " + doc); resolve();}
              if (index >= documentation.length - 1){resolve();}
            });
          });
        }, ()=> {
          // Fail to download
          if (index >= documentation.length - 1){resolve();}
        });
      }, () =>{
        // Is up to date / no connection
        if (index >= documentation.length - 1){resolve();}
      });
    });
  });
}

function DownloadAndWriteFiles(files: string[], url: string, local: string, ext: string = ""): Promise<string>{
  return new Promise((resolve, reject) => {

    files.forEach((partPath, index) =>{
      let name = path.basename(partPath) + ext;
      let directory = path.join(local, path.dirname(partPath));
      let fullPath = path.join(directory, name);
      CreateDirectory(directory).then(() =>{
        File(path.join(url, partPath)).then(rawData => {
          fs.writeFile(fullPath, rawData, {mode:0o444}, (err) => {
            if (err) { reject(); }
            if (index >= files.length - 1){
              resolve(rawData);} // All downloaded
          });
        }, (err) =>{
          reject(); // File not downloaded
        });
      }, (err) =>{
        reject(); // Directory did not created
      });
    });
  });
}

function CreateDirectory(pathToDirectory: string): Promise<void>{
  return new Promise((resolve, reject) => {
    fs.access(pathToDirectory, (err) =>{
      if (err){
        if(err.code === 'ENOENT'){ 
          fs.mkdir(pathToDirectory, {recursive: true}, () =>{resolve();});
        } else{ reject(err);}
      }
      resolve();
    });
  });
}

function CheckUpdate(url: string, local: string): Promise<nJsonUpdate.Data>{
  return new Promise((resolve, reject) => {
    const _pathLocal = path.join(local, 'Update.json');
    const _pathWeb = path.join(url, 'Update.json');
    let update:nJsonUpdate.Data = {date: 0};
    checkConnection().then((isConnected) =>{
      if (isConnected){
        ReadLocalUpdate(_pathLocal).then((updateLocal) =>{
          File(_pathWeb).then((raw) =>{
            try {update = JSON.parse(raw.toString());} 
            catch (e){ reject(updateLocal);}
            if (update.date > updateLocal.date){ 
              resolve(update);
            }
            reject(updateLocal);
          }, () =>{
            reject(update);
          });
        });
      } else{
        reject(update);
      }
    });
  });
}

function checkConnection(): Thenable<boolean> {
  return new Promise((resolve) => {
    dns.lookup('github.com', (err) => {
        if (err && err.code ==="ENOTFOUND") {
          resolve(false);
        } else {
          resolve (true);
        }
    });
  });
}

function ReadLocalUpdate(path: string): Thenable<nJsonUpdate.Data> {
  return new Promise((resolve) => {
    fs.access(path, fs.constants.F_OK, (err) =>{
      let update:nJsonUpdate.Data = {date: 0};
      if (err){ resolve(update);}
      else{
        fs.readFile(path, (err, raw) =>{
          try {update = JSON.parse(raw.toString());} 
          catch (e){ vscode.window.showErrorMessage("In parsing " + path); 
            fs.unlink(path, ()=>{
              resolve({date: 0});
            });
          }
          resolve(update);
        });
      }
    });
  });
}

function ReadLocalFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.access(path, fs.constants.F_OK, (err) =>{
      if (err){ reject();}
      else{
        fs.readFile(path, (err, raw) =>{
          if (err) { reject();}
          resolve(raw.toString());
        });
      }
    });
  });
}

function GetLocalJson<T>(local:string): Promise<T>{
  return new Promise((resolve, reject) => {
    ReadLocalFile(local).then((raw) => {
      let json: T;
      try {json = JSON.parse(raw.toString());} 
      catch (e){ vscode.window.showErrorMessage(e.toString()); reject();}
      json = JSON.parse(raw.toString());
      resolve(json);
    }, () =>{
      reject();
    });
  });
}

export function File(fileURL:string): Promise<string>{
  return new Promise((resolve, reject) => {
    const  urlParsed = url.parse(fileURL);
    let protocol = (urlParsed.protocol === 'https:') ? https : http;
    let request = protocol.get(fileURL, function(response) {

      if (response.statusCode === 200) {

      } else {
        reject('');
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
        reject('');
      });

      response.on('end', () =>{
        if (isNotResponse === true){raw = '';}
        resolve(raw);
      });
    });

    request.setTimeout(timeout, function () {
      request.abort();
      reject('');
    });
    request.on('error', (err) => {
      reject('');
    });
  });
}

export function DownloadPDF(fileURL: string, dest: string): Promise<void>{
  return new Promise((resolve, reject) => {

    const  urlParsed = url.parse(fileURL);
    let protocol = (urlParsed.protocol === 'https:') ? https : http;
    let request = protocol.get(fileURL, function(response) {


      if (response.statusCode === 200) {
        fs.mkdir(path.dirname(dest), {recursive: true}, ()=>{
          var file = fs.createWriteStream(dest);
          response.pipe(file);
        });
      } else {
        vscode.window.showErrorMessage(`Downloading ${fileURL} failed`);
      }

      response.on('error', (err) => {
        reject('');
      });

      response.on('end', () =>{
        resolve();
      });
    });

    request.setTimeout(timeout, function () {
      request.abort();
      reject('');
    });
    request.on('error', (err) => {
      reject('');
    });

    });
}