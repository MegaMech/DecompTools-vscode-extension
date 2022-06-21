import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { DecompToolsConfiguration } from "./configuration";
import { resolve } from 'path';
import { readdir } from 'fs/promises';


export class funcSizeCounter {
    
    public funcs?:string[];// string[];

    // todo: input box for typing what size of funcs you want to find.
    // todo: build treeview and display returned data.


    /**
     * size is bytes to check for
     * @param size kb
     **/
     async init_count(size: number) {
        const config = new DecompToolsConfiguration();



    ;(async () => {
        for await (const f of this.getFiles(config.reconfigurate("nonmatchingFolder"))) {
            fs.stat(f, (err, stats) => {
                if (err) console.error(err);

                if (stats.size <= 3000) {
                    const fileName = f.match(/[ \w-]+?(?=\.)/);
                    this.funcs?.push(String(fileName));
                }
            });
            
        }
        })()


}

    async *getFiles(dir: string): AsyncGenerator<string> {
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const res = resolve(dir, entry.name);
            if (entry.isDirectory()) {
                yield* this.getFiles(res);
            } else {
                yield res;
            }
        }
    }
}

// export class NodeDependenciesProvider implements vscode.TreeDataProvider<Dependency> {
//     constructor(private workspaceRoot: string) {}
  
//     getTreeItem(element: Dependency): vscode.TreeItem {
//       return element;
//     }
  
//     getChildren(element?: Dependency): Thenable<Dependency[]> {
//       if (!this.workspaceRoot) {
//         vscode.window.showInformationMessage('No dependency in empty workspace');
//         return Promise.resolve([]);
//       }
  
//       if (element) {
//         return Promise.resolve(
//           this.getDepsInPackageJson(
//             path.join(this.workspaceRoot, 'node_modules', element.label, 'package.json')
//           )
//         );
//       } else {
//         const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
//         if (this.pathExists(packageJsonPath)) {
//           return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
//         } else {
//           vscode.window.showInformationMessage('Workspace has no package.json');
//           return Promise.resolve([]);
//         }
//       }
//     }
// }

// export class Dependency extends vscode.TreeItem {

//     constructor(
//         public readonly label: string,
//         private readonly version: string,
//         public readonly collapsibleState: vscode.TreeItemCollapsibleState,
//         public readonly command?: vscode.Command
//     ) {
//         super(label, collapsibleState);

//         this.tooltip = `${this.label}-${this.version}`;
//         this.description = this.version;
//     }

//     iconPath = {
//         light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
//         dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
//     };

//     contextValue = 'dependency';
// }