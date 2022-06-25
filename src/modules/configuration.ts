import * as vscode from 'vscode';
import * as decomp_config from '../decomp_config';
import * as fs from 'fs';
import * as path from 'path';

export class DecompToolsConfiguration {

    public config: any;

    public init() {
        const config = vscode.workspace.getConfiguration('decompTools');
        const projPath = this.getWorkingPath();

        const mk = new decomp_config.mk64();
        const k = new decomp_config.kirby();

        const files =  fs.readdirSync(projPath);

        files.forEach(file => {
            if (mk.ld == file) {
                this.config = mk;
                return;
            } else if (k.ld == file) {
                this.config = k;
                return;

            }
        });
        this.getWorkingPath

    }

    public reconfigurate(option: string) {
        const extConfig = vscode.workspace.getConfiguration('decompTools');
        return String(extConfig.get(option));
    }

    public getWorkingPath(): string {
        if (vscode.workspace.workspaceFolders) {
            return path.normalize(String(vscode.workspace.workspaceFolders[0].uri.fsPath));
        } else {
            console.error("ERROR: YOU MUST BE IN A WORKSPACE OR FOLDER TO USE DECOMP TOOLS.");
            return "ERROR";
        }
    }
}