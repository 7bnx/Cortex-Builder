"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadPDF = exports.File = exports.GetDocumentation = exports.GetPdfViewer = exports.GetControllerList = exports.GetInclude = exports.GetCore = exports.GetSVD = exports.GetController = void 0;
const vscode = require("vscode");
const path = require("path");
const dns = require("dns");
const fs = require("fs");
const url = require("url");
const http = require("http");
const https = require("https");
const startup_1 = require("./startup");
const urlControllers = 'https://raw.githubusercontent.com/7bnx/Cortex-Builder-Essentials/master/Controllers';
const urlSVD = 'https://raw.githubusercontent.com/7bnx/Cortex-Builder-Essentials/master/SVD';
const urlCore = 'https://raw.githubusercontent.com/7bnx/Cortex-Builder-Essentials/master/Core';
const urlInclude = 'https://raw.githubusercontent.com/7bnx/Cortex-Builder-Essentials/master/Include';
const urlDocumentation = 'https://raw.githubusercontent.com/7bnx/Cortex-Builder-Essentials/master/Documentation';
const urlPdfViewer = 'https://raw.githubusercontent.com/7bnx/Cortex-Builder-Essentials/master/PdfViewer';
const coreFiles = ["cachel1_armv7.h", "cmsis_armcc.h", "cmsis_armclang.h", "cmsis_armclang_ltm.h",
    "cmsis_compiler.h", "cmsis_gcc.h", "cmsis_iccarm.h", "cmsis_version.h", "core_cm0.h",
    "core_cm0plus.h", "core_cm1.h", "core_cm3.h", "core_cm4.h", "core_cm7.h", "mpu_armv7.h"];
const timeout = 120000;
function GetController(controller) {
    return new Promise((resolve, reject) => {
        const local = path.join(startup_1.context.globalStoragePath, 'Controllers', controller);
        const name = controller + '.json';
        const url = path.join(urlControllers, controller);
        GetSingleFile(url, local, name).then(() => {
            GetLocalJson(path.join(local, name)).then((controller) => {
                resolve(controller);
            }, () => {
                reject();
            });
        }, () => {
            reject();
        });
    });
}
exports.GetController = GetController;
function GetSVD(svd) {
    return new Promise((resolve, reject) => {
        const local = path.join(startup_1.context.globalStoragePath, 'SVD', svd);
        const name = svd + '.svd';
        const url = path.join(urlSVD, svd);
        GetSingleFile(url, local, name).then(() => {
            resolve();
        }, () => {
            reject();
        });
    });
}
exports.GetSVD = GetSVD;
function GetSingleFile(url, local, name) {
    return new Promise((resolve, reject) => {
        const localUpdate = path.join(local, "Update.json");
        const localFull = path.join(local, name);
        CheckUpdate(url, local).then((update) => {
            fs.chmod(localFull, 0o666, (err) => {
                fs.chmod(localUpdate, 0o666, (err) => {
                    DownloadAndWriteFiles([name], url, local).then((raw) => {
                        fs.writeFile(localUpdate, JSON.stringify(update, null, "\t"), { mode: 0o444 }, err => {
                            if (err) {
                                vscode.window.showErrorMessage("Write Error 'Update.json' in " + local);
                                reject();
                            }
                            resolve(raw);
                        });
                    }, (err) => {
                        // Error while loading include files
                        reject();
                    });
                });
            });
        }, () => {
            resolve('');
            // Up to date / no connection
        });
    });
}
function GetCore() {
    return new Promise((resolve, reject) => {
        const localCore = path.join(startup_1.context.globalStoragePath, 'Core');
        const localUpdate = path.join(localCore, "Update.json");
        CheckUpdate(urlCore, localCore).then((update) => {
            fs.rmdir(localCore, { recursive: true }, (err) => {
                DownloadAndWriteFiles(coreFiles, urlCore, localCore).then(() => {
                    fs.writeFile(localUpdate, JSON.stringify(update, null, "\t"), { mode: 0o444 }, err => {
                        if (err) {
                            vscode.window.showErrorMessage("Write Error 'Update.json' in Core");
                            reject();
                        }
                        resolve();
                    });
                }, () => {
                    // Error while loading core files
                    reject();
                });
            });
        }, () => {
            resolve();
            // Up to date / no connection
        });
    });
}
exports.GetCore = GetCore;
function GetInclude(include) {
    return new Promise((resolve, reject) => {
        const local = path.join(startup_1.context.globalStoragePath, 'Include', include);
        const name = include + '.h';
        const url = path.join(urlInclude, include);
        GetSingleFile(url, local, name).then(() => {
            resolve();
        }, () => {
            reject();
        });
    });
}
exports.GetInclude = GetInclude;
function GetControllerList() {
    return new Promise((resolve, reject) => {
        const local = path.join(startup_1.context.globalStoragePath, 'Controllers');
        const name = 'ControllersList.json';
        GetSingleFile(urlControllers, local, name).then(() => {
            GetLocalJson(path.join(local, name)).then((list) => {
                resolve(list);
            }, () => {
                reject();
            });
        }, () => {
            reject();
        });
    });
}
exports.GetControllerList = GetControllerList;
function GetPdfViewer() {
    return new Promise((resolve, reject) => {
        const localPdfViewer = path.join(startup_1.context.globalStoragePath, 'PdfViewer');
        const localUpdate = path.join(localPdfViewer, "Update.json");
        CheckUpdate(urlPdfViewer, localPdfViewer).then((update) => {
            File(path.join(urlPdfViewer, 'Files.json')).then(raw => {
                let list = { files: [] };
                try {
                    list = JSON.parse(raw);
                }
                catch (e) {
                    vscode.window.showErrorMessage("Error downloading PdfViewer files");
                    reject();
                }
                fs.rmdir(localPdfViewer, { recursive: true }, (err) => {
                    list.files.forEach((file, index) => {
                        let url = path.join(urlPdfViewer, file);
                        let local = path.join(localPdfViewer, file);
                        DownloadPDF(url, local).then(() => {
                            if (index >= list.files.length - 1) {
                                fs.chmod(localUpdate, 0o666, (err) => {
                                    fs.writeFile(localUpdate, JSON.stringify(update, null, "\t"), { mode: 0o444 }, (err) => {
                                        if (err) {
                                            vscode.window.showErrorMessage("Write Error 'Update.json' in PDF Viewer");
                                            reject();
                                        }
                                        resolve();
                                    });
                                });
                            }
                        }, () => {
                            // Fail to download
                            reject();
                        });
                    });
                });
            }, () => {
                reject();
                // Error, while loading list of files
            });
        }, () => {
            resolve();
            // Up to date / no connection
        });
    });
}
exports.GetPdfViewer = GetPdfViewer;
function GetDocumentation(documentation) {
    return new Promise((resolve, reject) => {
        if (!documentation || documentation.length === 0) {
            resolve();
        }
        documentation.forEach((doc, index) => {
            let name = path.basename(doc) + '.pdf';
            let url = path.join(urlDocumentation, doc);
            let local = path.join(startup_1.context.globalStoragePath, 'Documentation', doc);
            let localUpdate = path.join(local, 'Update.json');
            CheckUpdate(url, local).then((update) => {
                DownloadPDF(path.join(url, name), path.join(local, name)).then(() => {
                    fs.chmod(localUpdate, 0o666, (err) => {
                        fs.writeFile(localUpdate, JSON.stringify(update, null, "\t"), { mode: 0o444 }, (err) => {
                            if (err) {
                                vscode.window.showErrorMessage("Write Error 'Update.json' in " + doc);
                                resolve();
                            }
                            if (index >= documentation.length - 1) {
                                resolve();
                            }
                        });
                    });
                }, () => {
                    // Fail to download
                    if (index >= documentation.length - 1) {
                        resolve();
                    }
                });
            }, () => {
                // Is up to date / no connection
                if (index >= documentation.length - 1) {
                    resolve();
                }
            });
        });
    });
}
exports.GetDocumentation = GetDocumentation;
function DownloadAndWriteFiles(files, url, local, ext = "") {
    return new Promise((resolve, reject) => {
        files.forEach((partPath, index) => {
            let name = path.basename(partPath) + ext;
            let directory = path.join(local, path.dirname(partPath));
            let fullPath = path.join(directory, name);
            CreateDirectory(directory).then(() => {
                File(path.join(url, partPath)).then(rawData => {
                    fs.writeFile(fullPath, rawData, { mode: 0o444 }, (err) => {
                        if (err) {
                            reject();
                        }
                        if (index >= files.length - 1) {
                            resolve(rawData);
                        } // All downloaded
                    });
                }, (err) => {
                    reject(); // File not downloaded
                });
            }, (err) => {
                reject(); // Directory did not created
            });
        });
    });
}
function CreateDirectory(pathToDirectory) {
    return new Promise((resolve, reject) => {
        fs.access(pathToDirectory, (err) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    fs.mkdir(pathToDirectory, { recursive: true }, () => { resolve(); });
                }
                else {
                    reject(err);
                }
            }
            resolve();
        });
    });
}
function CheckUpdate(url, local) {
    return new Promise((resolve, reject) => {
        const _pathLocal = path.join(local, 'Update.json');
        const _pathWeb = path.join(url, 'Update.json');
        let update = { date: 0 };
        checkConnection().then((isConnected) => {
            if (isConnected) {
                ReadLocalUpdate(_pathLocal).then((updateLocal) => {
                    File(_pathWeb).then((raw) => {
                        try {
                            update = JSON.parse(raw.toString());
                        }
                        catch (e) {
                            reject(updateLocal);
                        }
                        if (update.date > updateLocal.date) {
                            resolve(update);
                        }
                        reject(updateLocal);
                    }, () => {
                        reject(update);
                    });
                });
            }
            else {
                reject(update);
            }
        });
    });
}
function checkConnection() {
    return new Promise((resolve) => {
        dns.lookup('github.com', (err) => {
            if (err && err.code === "ENOTFOUND") {
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
}
function ReadLocalUpdate(path) {
    return new Promise((resolve) => {
        fs.access(path, fs.constants.F_OK, (err) => {
            let update = { date: 0 };
            if (err) {
                resolve(update);
            }
            else {
                fs.readFile(path, (err, raw) => {
                    try {
                        update = JSON.parse(raw.toString());
                    }
                    catch (e) {
                        vscode.window.showErrorMessage("In parsing " + path);
                        fs.unlink(path, () => {
                            resolve({ date: 0 });
                        });
                    }
                    resolve(update);
                });
            }
        });
    });
}
function ReadLocalFile(path) {
    return new Promise((resolve, reject) => {
        fs.access(path, fs.constants.F_OK, (err) => {
            if (err) {
                reject();
            }
            else {
                fs.readFile(path, (err, raw) => {
                    if (err) {
                        reject();
                    }
                    resolve(raw.toString());
                });
            }
        });
    });
}
function GetLocalJson(local) {
    return new Promise((resolve, reject) => {
        ReadLocalFile(local).then((raw) => {
            let json;
            try {
                json = JSON.parse(raw.toString());
            }
            catch (e) {
                vscode.window.showErrorMessage(e.toString());
                reject();
            }
            json = JSON.parse(raw.toString());
            resolve(json);
        }, () => {
            reject();
        });
    });
}
function File(fileURL) {
    return new Promise((resolve, reject) => {
        const urlParsed = url.parse(fileURL);
        let protocol = (urlParsed.protocol === 'https:') ? https : http;
        let request = protocol.get(fileURL, function (response) {
            if (response.statusCode === 200) {
            }
            else {
                reject('');
            }
            let raw = '';
            let isNotResponse = false;
            response.on('data', (chunk) => {
                if (response.statusCode === 200) {
                    raw += chunk;
                }
                else {
                    isNotResponse = true;
                }
            });
            response.on('error', (err) => {
                reject('');
            });
            response.on('end', () => {
                if (isNotResponse === true) {
                    raw = '';
                }
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
exports.File = File;
function DownloadPDF(fileURL, dest) {
    return new Promise((resolve, reject) => {
        const urlParsed = url.parse(fileURL);
        let protocol = (urlParsed.protocol === 'https:') ? https : http;
        let request = protocol.get(fileURL, function (response) {
            if (response.statusCode === 200) {
                fs.mkdir(path.dirname(dest), { recursive: true }, () => {
                    var file = fs.createWriteStream(dest);
                    response.pipe(file);
                });
            }
            else {
                vscode.window.showErrorMessage(`Downloading ${fileURL} failed`);
            }
            response.on('error', (err) => {
                reject('');
            });
            response.on('end', () => {
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
exports.DownloadPDF = DownloadPDF;
//# sourceMappingURL=download.js.map