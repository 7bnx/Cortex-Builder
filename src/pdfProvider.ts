import * as vscode from 'vscode';
import { PdfViewer } from './pdfViewer';

export class PdfProvider implements vscode.CustomReadonlyEditorProvider {
  public static readonly viewType = 'pdf.viewer';

  private readonly _previews = new Set<PdfViewer>();
  private _activePreview: PdfViewer | undefined;
  private readonly extensionRoot: vscode.Uri;
  constructor(_context: vscode.ExtensionContext) {
    this.extensionRoot = _context.extensionUri;

    _context.subscriptions.push(
      vscode.window.registerCustomEditorProvider(
        PdfProvider.viewType,
        this,
        {
          webviewOptions: {
            enableFindWidget: false, // default
            retainContextWhenHidden: true,
          },
        }
      )
    );
  }

  public openCustomDocument(uri: vscode.Uri): vscode.CustomDocument {
    return { uri, dispose: (): void => {} };
  }
   

  public async resolveCustomEditor(
    document: vscode.CustomDocument,
    webviewEditor: vscode.WebviewPanel
  ): Promise<void> {
    const preview = new PdfViewer(
      this.extensionRoot,
      document.uri,
      webviewEditor
    );
    this._previews.add(preview);
    this.setActivePreview(preview);

    webviewEditor.onDidDispose(() => {
      this._previews.delete(preview);
    });

    webviewEditor.onDidChangeViewState(() => {
      if (webviewEditor.active) {
        this.setActivePreview(preview);
      } else if (this._activePreview === preview && !webviewEditor.active) {
        this.setActivePreview(undefined);
      }
    });
  }

  public get activePreview(): PdfViewer | undefined{
    return this._activePreview;
  }

  private setActivePreview(value: PdfViewer | undefined): void {
    this._activePreview = value;
  }
}