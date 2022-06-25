import * as vscode from 'vscode';
import * as decomp_config from '../decomp_config';
import * as fs from 'fs';
import * as path from 'path';

export class DecompToolsConfiguration {

    public config: any;

    public init() {
        const config = vscode.workspace.getConfiguration('decompTools');
        const projPath = String(config.get("projectPath"));

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

    }

    public reconfigurate(option: string) {
        const extConfig = vscode.workspace.getConfiguration('decompTools');
        return String(extConfig.get(option));
    }
}