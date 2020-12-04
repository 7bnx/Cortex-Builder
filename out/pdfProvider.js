"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfProvider = void 0;
const vscode = require("vscode");
const pdfViewer_1 = require("./pdfViewer");
class PdfProvider {
    constructor(_context) {
        this._previews = new Set();
        this.extensionRoot = _context.extensionUri;
        _context.subscriptions.push(vscode.window.registerCustomEditorProvider(PdfProvider.viewType, this, {
            webviewOptions: {
                enableFindWidget: false,
                retainContextWhenHidden: true,
            },
        }));
    }
    openCustomDocument(uri) {
        return { uri, dispose: () => { } };
    }
    resolveCustomEditor(document, webviewEditor) {
        return __awaiter(this, void 0, void 0, function* () {
            const preview = new pdfViewer_1.PdfViewer(this.extensionRoot, document.uri, webviewEditor);
            this._previews.add(preview);
            this.setActivePreview(preview);
            webviewEditor.onDidDispose(() => {
                this._previews.delete(preview);
            });
            webviewEditor.onDidChangeViewState(() => {
                if (webviewEditor.active) {
                    this.setActivePreview(preview);
                }
                else if (this._activePreview === preview && !webviewEditor.active) {
                    this.setActivePreview(undefined);
                }
            });
        });
    }
    get activePreview() {
        return this._activePreview;
    }
    setActivePreview(value) {
        this._activePreview = value;
    }
}
exports.PdfProvider = PdfProvider;
PdfProvider.viewType = 'pdf.viewer';
//# sourceMappingURL=pdfProvider.js.map