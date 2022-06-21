import * as vscode from 'vscode';

export class DecompToolsConfiguration {

    reconfigurate(option: string) {
        const extConfig = vscode.workspace.getConfiguration('decompTools');

        return String(extConfig.get(option));
    }
}