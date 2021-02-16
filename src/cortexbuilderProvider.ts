import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as nMakefile from './Creator/Makefile';
import * as nC_CPP_Properties from './Creator/C_CPP_Properties';
import * as nCortexBuilder from './Creator/CortexBuilder';


export class CortexBuilderProvider implements vscode.TreeDataProvider<vscode.TreeItem>{
	private rootFolder ='';
	private context: vscode.ExtensionContext;
  private sources:  AddedTreeViewItem[] = [];
	private includes: AddedTreeViewItem[] = [];
	private project: AddedProjectTreeViewItem[] = [];
	private documentation: AddedDocumentationTreeViewItem[] = [];
  private items:ItemsTreeView = {
    includes:[],
    includesDir: [],
    sources: []
  };
	private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined> = new vscode.EventEmitter<vscode.TreeItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined> = this._onDidChangeTreeData.event;

	constructor(context: vscode.ExtensionContext){
    
		let open = vscode.commands.registerCommand('cortexBuilderProvider.openFile', (resource) => {
			vscode.window.showTextDocument(resource,{preview: false});});

		let addNew = vscode.commands.registerCommand('cortexBuilderProvider.createNew', (element) => {
			this.NewFileHandler(element);});

    let addExisting = vscode.commands.registerCommand('cortexBuilderProvider.addExisting', (element) => {
      this.AddExistingFile(element);});

    let _delete = vscode.commands.registerCommand('cortexBuilderProvider.removeFile', (element) => {
			this.DeleteFile(element);});
		
			context.subscriptions.push(open);
			context.subscriptions.push(addNew);
			context.subscriptions.push(addExisting);
			context.subscriptions.push(_delete);

		this.context = context;
		if (vscode.workspace.workspaceFolders !== undefined){this.rootFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;}
	}

	public PushSource(sourcePath: string[]){
		sourcePath.forEach(item => {
			this.items.sources.push(item);
    });
		this.items.sources = Array.from(new Set(this.items.sources));
		this.sources = new Array(this.items.sources.length);
		this.Push(this.items.sources, this.sources);
		nMakefile.UpdateSource(this.items.sources);
		nCortexBuilder.UpdateSources(this.items.sources);
	}

  public PushInclude(includePath: string[]){
		includePath.forEach(item =>{
			if (item !== undefined){
				this.items.includes.push(item);
				this.items.includesDir.push(path.dirname(item));
			}
		});
		this.items.includesDir = Array.from(new Set(this.items.includesDir));
		this.items.includes = Array.from(new Set(this.items.includes));
		this.includes = new Array(this.items.includes.length);
		this.Push(this.items.includes, this.includes);
		nMakefile.UpdateIncludeDir(this.items.includesDir);
    nC_CPP_Properties.UpdateIncludesDir(this.items.includesDir);
    nCortexBuilder.UpdateIncludes(this.items.includes, this.items.includesDir);
	}

	public PushItems(items: ItemsTreeView, controllerInclude:string, docs: string[]){
		controllerInclude = path.join(this.context.globalStoragePath, 'Include',controllerInclude, controllerInclude + '.h');
		items.includes = items.includes.filter(e => e !== controllerInclude);
		docs = docs ? docs : [];
		this.items = items;
		this.sources = new Array(items.sources.length);
		this.includes = new Array(items.includes.length);
		this.project = new Array(4);
		this.documentation = new Array(docs.length);
		items.sources.forEach((src, index) =>{
			this.sources[index] = new AddedTreeViewItem(src);
		});
		items.includes.forEach((inc, index) =>{
			this.includes[index] = new AddedTreeViewItem(inc);		
		});
		this.project[0] = new AddedProjectTreeViewItem(path.join(this.rootFolder, 'Makefile'));
		this.project[1] = new AddedProjectTreeViewItem(path.join(this.rootFolder, 'Startup.s'));
		this.project[2] = new AddedProjectTreeViewItem(path.join(this.rootFolder, 'Linker.ld'));
		this.project[3] = new AddedProjectTreeViewItem(controllerInclude);

		for(let i = 0; i < docs.length; ++i){
			this.documentation[i] = new AddedDocumentationTreeViewItem(docs[i]);
		}

		this.refresh();
	}

	private Push(items:string[], treeItems:AddedTreeViewItem[]){
		items.forEach((item, index) =>{
			treeItems[index] = new AddedTreeViewItem(item);
		});
		this.refresh();		
	}

	public DeleteFile(element: AddedTreeViewItem){
		let isSource = false;
		if(element.label === undefined || element.tooltip === undefined){return;}
		let length:number = element.label.length;
		let viewItem:AddedTreeViewItem[] = this.includes;
		if (element.label?.charAt(length - 1) === 'c' ||
				element.label?.charAt(length - 3) === 'c' ||
				element.label?.charAt(length - 1) === 's'){ viewItem = this.sources; isSource = true;}
		let index = viewItem.findIndex(item => item.tooltip === element.tooltip);
		if (index >= 0){
			if (isSource){
				let index = this.items.sources.indexOf(element.tooltip);
				this.items.sources.splice(index,1);
				nMakefile.UpdateSource(this.items.sources);
				nCortexBuilder.UpdateSources(this.items.sources);
			} else{
				let index = this.items.includes.indexOf(element.tooltip);
				this.items.includes.splice(index,1);
				let isDirUses = false;
				this.items.includesDir.forEach(dir => {
					isDirUses = false;
					this.items.includes.forEach(inc =>{
						if (dir === path.dirname(inc)){isDirUses = true;}
					});
					if (isDirUses === false && dir !== path.join(this.rootFolder, 'user') && !dir.includes(this.context.globalStoragePath)){
						let index = this.items.includesDir.indexOf(dir); 
						this.items.includesDir.splice(index,1);}
				});
				nMakefile.UpdateIncludeDir(this.items.includesDir);
				nC_CPP_Properties.UpdateIncludesDir(this.items.includesDir);
				nCortexBuilder.UpdateIncludes(this.items.includes, this.items.includesDir);
			}
			viewItem.splice(index, 1);
			this.refresh();
		}
	}

	public DeleteSource(sourcePath: string){
		let index = this.sources.findIndex(item => item.tooltip === sourcePath);
		if (index >= 0){
			this.sources.splice(index, 1);
			this.refresh();
		}
	}

  public DeleteInclude(includePath: string){
		let index = this.includes.findIndex(item => item.tooltip === includePath);
		if (index >= 0){
			this.includes.splice(index, 1);
			this.refresh();
		}
	}

	public NewFileHandler(element:any){
		let ext = ["H", "HPP"];
		if (element.label === "Sources"){ext = ["C", "CPP", "S"];}
		let quickPickOptions:vscode.QuickPickOptions = {
			placeHolder: "Select source type",
			matchOnDetail: true,
			matchOnDescription: true
		};
		vscode.window.showQuickPick(ext, quickPickOptions).then(type =>{
			let inputBoxOptions:vscode.InputBoxOptions = {
				prompt: "Select name"
			};
			if(type === undefined){return;}
			vscode.window.showInputBox(inputBoxOptions).then(name => {
				let _path = path.join(this.rootFolder,'user');
				if (name !== undefined && type !== undefined){
					if(element.label === "Includes"){
						this.CreateNewFile(_path, name, type).then(fullPath =>{
							this.PushInclude([fullPath]);
						});
					}
					else {
						this.CreateNewFile(_path, name, type).then(fullPath =>{
							this.PushSource([fullPath]);
						});
					};
				}
			});
		});
	}

	private CreateNewFile(_path:string, name:string, ext:string): Promise<string>{
		return new Promise((resolve, reject) => {
			fs.readdir(_path, (err,files) =>{
				_path = path.join(_path, name + '.' + ext.toLocaleLowerCase());
				let i = 0;
				for(;i < files.length; ++i){
					if(files[i] === path.basename(_path)){
						vscode.window.showErrorMessage("The file '" + files[i] +"' is already exsists");
						break;}
					}
					if (i >= files.length){fs.writeFile(_path,"", () =>{});}
					vscode.workspace.openTextDocument(vscode.Uri.file(_path)).then(doc => {
						vscode.window.showTextDocument(doc);
					});
					resolve(_path);
			});
		});
	}

	public AddExistingFile(element: any){
		if (element.label === "Sources"){
			let openDialogOptions: vscode.OpenDialogOptions = {
				canSelectFiles: true,
				canSelectMany: true,
				canSelectFolders: false,
				filters:{
					source: ['c', 'cpp', 's']
				}
			};
			vscode.window.showOpenDialog(openDialogOptions).then(files =>{
				if (files !== undefined){
					let _files:string[] = [];
					files.forEach(file => {_files.push(file.fsPath);});
					this.PushSource(_files);
				}
			});
		} else if (element.label === "Includes"){
		let openDialogOptions: vscode.OpenDialogOptions = {
			canSelectFiles: false,
			canSelectMany: true,
			canSelectFolders: true
		};
		vscode.window.showOpenDialog(openDialogOptions).then(folders =>{
				if (folders !== undefined){
					folders.forEach(folder => {
						let files:string[] = [];
						fs.readdir(folder.fsPath, (err, names) =>{
							names.forEach(name => {
								if (path.extname(name) === '.h' || path.extname(name) === '.hpp'){
									files.push(path.join(folder.fsPath, name));
								}
							});
							this.PushInclude(files);
						});
					});
				}
			});
		}
	}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem|Thenable<vscode.TreeItem> {
		return element;
	}
	
	getChildren(element?: vscode.TreeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
		if (element){
			if (element.label === "Sources"){ return Promise.resolve(this.sources);} 
			else if (element.label === "Includes") {return Promise.resolve(this.includes);}
			else if(element.label === "Project"){return Promise.resolve(this.project);}
			else {return Promise.resolve(this.documentation);}
		} else{
			let sources = new RootTreeViewItem("Sources");
			let includes = new RootTreeViewItem("Includes");
			let project = new RootProjectTreeViewItem("Project");
			let documentation = new RootDocumenetationTreeViewItem("Documentation");
			return Promise.resolve([sources, includes, project, documentation]);
		}
  }
}

export interface ItemsTreeView{
	includes: string[];
	includesDir: string[];
	sources:	string[]
}

class RootTreeViewItem extends vscode.TreeItem {
	constructor(
    public readonly label: string
  ) {
		super(label, vscode.TreeItemCollapsibleState.Expanded);
		this.contextValue = "RootTreeViewItem";
  }
}

class RootProjectTreeViewItem extends vscode.TreeItem {
	constructor(
    public readonly label: string
  ) {
		super(label, vscode.TreeItemCollapsibleState.Expanded);
		this.contextValue = "RootProjectTreeViewItem";
  }
}

class RootDocumenetationTreeViewItem extends vscode.TreeItem {
	constructor(
    public readonly label: string
  ) {
		super(label, vscode.TreeItemCollapsibleState.Expanded);
		this.contextValue = "RootDocumenetationTreeViewItem";
  }
}

class AddedTreeViewItem extends vscode.TreeItem {
	constructor(fsPath:string){
		super(path.basename(fsPath), vscode.TreeItemCollapsibleState.None);
		this.contextValue = "AddedTreeViewItem";
		this.tooltip = fsPath;
		this.command = { 
			command: 'cortexBuilderProvider.openFile', 
			title: "Open File", 
			arguments: [vscode.Uri.file(fsPath)] };
		let iconPath:string = 'type_cpp_header.svg';
		let lastChar = this.label?.charAt(this.label.length-1);
		let preLastChar = this.label?.charAt(this.label.length-3);
		if (lastChar === 'c'){iconPath = 'type_c.svg';}
		else if (lastChar === 'h'){iconPath = 'type_c_header.svg';}
		else if (lastChar === 's'){iconPath = 'type_asm.svg';}
		else if (preLastChar === 'c'){iconPath = 'type_cpp.svg';}
		this.iconPath = {
			dark : path.join(__dirname, '..', 'resources', 'images', iconPath),
			light: path.join(__dirname, '..', 'resources', 'images', iconPath)
		};
	}
}

class AddedProjectTreeViewItem extends vscode.TreeItem {
	constructor(fsPath:string){
		super(path.basename(fsPath), vscode.TreeItemCollapsibleState.None);
		this.contextValue = "AddedProjectTreeViewItem";
		this.tooltip = fsPath;
		this.command = { 
			command: 'cortexBuilderProvider.openFile', 
			title: "Open File", 
			arguments: [vscode.Uri.file(fsPath)] };
		let iconPath:string = 'type_cpp_header.svg';
		let lastChar = this.label?.charAt(this.label.length-1);
		let preLastChar = this.label?.charAt(this.label.length-3);
		if (lastChar === 'c'){iconPath = 'type_c.svg';}
		else if (lastChar === 'h'){iconPath = 'type_c_header.svg';}
		else if (preLastChar === 'c'){iconPath = 'type_cpp.svg';}
		else if (fsPath.includes('Makefile')){iconPath = 'type_Makefile.svg';}
		else if (lastChar === 's'){iconPath = 'type_asm.svg';}
		else if (lastChar === 'd'){iconPath = 'type_ld.svg';}
		this.iconPath = {
			dark : path.join(__dirname, '..', 'resources', 'images', iconPath),
			light: path.join(__dirname, '..', 'resources', 'images', iconPath)
		};
	}
}

class AddedDocumentationTreeViewItem extends vscode.TreeItem {
	children: vscode.TreeItem[]|undefined;
	constructor(fsPath:string, children?: vscode.TreeItem[]){
		let pathFile = path.dirname(fsPath).split(path.sep);
		let label = pathFile[pathFile.length-2];
		super(label, vscode.TreeItemCollapsibleState.None);
		this.contextValue = "AddedDocumentationTreeViewItem";
		this.tooltip = fsPath;
		this.command = { 
			command: 'vscode.openWith', 
			title: "Open File", 
			arguments: [vscode.Uri.file(fsPath), 'pdf.viewer', {preview: false}] };
		let iconPath:string = 'type_pdf.svg';
		this.iconPath = {
			dark : path.join(__dirname, '..', 'resources', 'images', iconPath),
			light: path.join(__dirname, '..', 'resources', 'images', iconPath)
		};
		
		this.children = children;
	}
}