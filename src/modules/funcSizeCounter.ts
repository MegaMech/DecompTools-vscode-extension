import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { DecompToolsConfiguration } from "./configuration";
import { resolve } from 'path';
import { readdir } from 'fs/promises';
import * as utils from '../utils';


export class funcSizeCounter {
    
    readonly onDidChangeTreeData: vscode.EventEmitter<TreeData | undefined | null | void> = new vscode.EventEmitter<TreeData | undefined | null | void>();
    private sizeRef: sizeData;
    private config = new DecompToolsConfiguration();
    private counter: number;
    private totalFuncsFound: number;
    private childData: TreeData[];
    private provider?: FunctionTreeProvider;
    constructor() {
        this.sizeRef = new sizeData();
        this.config.init();
        this.counter = 0;
        this.totalFuncsFound = 0;
        this.childData = [];
    }
    /**
     * size is bytes to check for
     * @param size kb
     **/
    async init_count(context: vscode.ExtensionContext, size: number) {
                
        const commandHandler = async (doc: vscode.Uri, func: string) => {
            vscode.window.showTextDocument(doc);
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                let document = activeEditor.document;
    
                // Get the document text
                const documentText = document.getText();
                for (let i = 0; i < document.lineCount; i++) {
                    const text = document.lineAt(i+1);
                    if (text.text.search(String(func)) != -1) {
                        if (text.text.search(";") != -1) { continue; }
                        await vscode.commands.executeCommand("revealLine", {
                            lineNumber: i+1,
                            at: "top",
                        });
                        break;
                    };
                }
            }
        };
        
        context.subscriptions.push(vscode.commands.registerCommand("decomp.openfunction", commandHandler));
        
        
        this.sizeRef.size = size;
        const treeData = await this.searchFiles();

        this.provider = new FunctionTreeProvider(treeData, this.onDidChangeTreeData);
        
        vscode.window.registerTreeDataProvider('funcs_view', this.provider);
    }
    public async update(size: number) {
        this.sizeRef.size = size;
        if (!this.provider) { return; }
        this.provider.data = await this.searchFiles();
        this.onDidChangeTreeData.fire();
    }
    private async searchFiles(): Promise<TreeData[]> {
        // Build root elements
        const projDir = this.config.getWorkingPath();
        const srcDir = this.config.config.srcDir;
        const fullPath = path.normalize(projDir+"/"+this.config.config.asmDir+"/"+this.config.config.nonmatchingDir);
        const extension = this.config.config.extension;
        const str = utils.getDirectoriesRecursive(fullPath);
        // Remove root directory from array.
        str.shift();
        let data:any = [];
        this.totalFuncsFound = 0;
        for (let el of str) {
            let pathd = path.normalize(el);
            this.childData = [];
            this.counter = 0;

            // Build children
            for await (const f of utils.getFiles(pathd)) {
                const stats = fs.statSync(f);
 
                if (stats.size <= this.sizeRef.size) {
                    this.counter++;
                    this.totalFuncsFound++;
                    const fileUri = vscode.Uri.file(path.normalize(projDir+"/"+srcDir+"/"+el.replace(/.*\\([^\\]+)\\/, "")+extension));
                    this.childData.push(
                        new TreeData(String(f.match(/[ \w-]+?(?=\.)/)),  fileUri, vscode.TreeItemCollapsibleState.None));
                }
            }
            if (this.counter == 0) { continue; }
            const a = new TreeData(String(el.match(/[ \w-]+?(?=$)/)), el, vscode.TreeItemCollapsibleState.Expanded, this.childData);
            data.push(a);
        }
        vscode.window.showInformationMessage("Found "+this.totalFuncsFound+" funcs.");
        return data;
    }
}

export class sizeData {
    public size: number;
    constructor() {
        this.size = 0;
    }
}

export class TreeData extends vscode.TreeItem {
    public command?: vscode.Command;
    constructor(
        public readonly label: string,
        public readonly path: vscode.Uri,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public children?: TreeData[] | undefined,
        ) {
            super(label, collapsibleState);
            this.children = children;
            if (!children) {
                this.command = {title: this.label,command: "decomp.openfunction", arguments: [this.path, this.label]};
            }
        }
}

export class FunctionTreeProvider implements vscode.TreeDataProvider<TreeData> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeData | undefined | null | void>;
    
    
    public data: TreeData[];

    constructor(private results: TreeData[], 
        ondid: vscode.EventEmitter<TreeData | undefined | null | void>
        ) {
            this._onDidChangeTreeData = ondid;
            this.data = results;
        }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
  
    getTreeItem(element: TreeData): vscode.TreeItem {
        return element;
    }
    
    getChildren(element?: TreeData | undefined): vscode.ProviderResult<TreeData[]> {
        if (element === undefined) {
            return this.data;
        }
        return element.children;
    }
}
