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
    constructor() {
        this.sizeRef = new sizeData();
    }
    /**
     * size is bytes to check for
     * @param size kb
     **/
    async init_count(size: number) {
        this.sizeRef.size = size;

        const config = new DecompToolsConfiguration();
    
        const provider = new FunctionTreeProvider(this.sizeRef, this.onDidChangeTreeData);
        
        vscode.window.registerTreeDataProvider('funcs_view', provider);
    }
    public update(size: number) {
        this.sizeRef.size = size;
        this.onDidChangeTreeData.fire();
    }
}

export class sizeData {
    public size: number;
    constructor() {
        this.size = 0;
    }
}

export class TreeData extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly path: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    ) {
        super(label, collapsibleState);
    }
}

export class FunctionTreeProvider implements vscode.TreeDataProvider<TreeData> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeData | undefined | null | void>;
    
    
    public funcs: TreeData[];

    private config = new DecompToolsConfiguration();
    constructor(private sizeRef: sizeData, 
        ondid: vscode.EventEmitter<TreeData | undefined | null | void>
        ) {
        this.funcs = [];
        this._onDidChangeTreeData = ondid;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
  
    getTreeItem(element: TreeData): vscode.TreeItem {
        return element;
    }
    
    async getChildren(element?: TreeData): Promise<TreeData[]> {
        // Build root elements
        if (!element) {
            const str = utils.getDirectoriesRecursive(this.config.reconfigurate("nonmatchingFolder"));
            str.shift();str.shift();str.shift();
            let data:TreeData[] = [];
            for (let el of str) {

                let counter = 0;
                for await (const f of utils.getFiles(el)) {
                    fs.stat(f, (err, stats) => {
                        if (err) console.error(err);
    
                        if (stats.size <= this.sizeRef.size) {
                            counter++;
                        }
                    });
                }
                if (counter = 0) { continue; }

                const a = new TreeData(String(el.match(/[ \w-]+?(?=$)/)), el, vscode.TreeItemCollapsibleState.Collapsed);
                data.push(a);
            }
            return data;
        }
        // Use reference data to build tree items (children).
        //console.log(element.path);
        await this.getTreeFiles(element.path, this.sizeRef.size);
        return this.funcs;
    }

    private getTreeFiles(patha: string, size: number) {
        return (async () => {
            for await (const f of utils.getFiles(patha)) {
                fs.stat(f, (err, stats) => {
                    if (err) console.error(err);

                    if (stats.size <= size) {
                        const fileName = f.match(/[ \w-]+?(?=\.)/);
                        const a = new TreeData(fileName+".s",String(f), vscode.TreeItemCollapsibleState.None);
                        this.funcs.push(a);
                    }
                });
                
            }
        })()
    }
}
