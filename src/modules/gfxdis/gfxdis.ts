import { spawnSync } from 'child_process';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { DecompToolsConfiguration } from '../configuration';
import { viewGfxDocument } from './gfxdis.html';

export class gfxdis {

    public init(context: vscode.ExtensionContext) {
        const provider = new gfxdisViewProvider(context.extensionPath, context, this);
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(gfxdisViewProvider.viewType, provider));
    }

    public parse_m2c(webview: vscode.Webview) {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor == undefined) { return; }

        let start = activeEditor.selection.start;
        let end = activeEditor.selection.end;

        let highlight = activeEditor.document.getText(new vscode.Range(start, end));

        let unk0 = highlight.match(/(?<=->unk0 = ).*/g);
        let unk4 = highlight.match(/(?<=->unk4 = ).*/g);
        
        let str = "";

        if (unk0 && unk4) {

            for (let i = 0; i < unk0.length; i++) {
                unk0[i] = unk0[i].replace(/;/g, "");
            }
            for (let i = 0; i < unk0.length; i++) {
                unk4[i] = unk4[i].replace(/;/g, "");
            }

            for (let i = 0; i < unk0.length; i++) {
                if (Number.isNaN(Number(unk0[i])) || Number.isNaN(Number(unk4[i]))) {
                    str += "err"+i+".\n";
                    continue;
                }

                if (unk0[i].search("0x") == -1) {unk0[i] = "0x"+unk0[i]}

                while (unk0[i].length < 10) {
                    unk0[i] = unk0[i].substr(0,2)+"0"+unk0[i].substr(2);
                }


                if (unk4[i].search("0x") == -1) {unk4[i] = "0x"+unk4[i]}

                while (unk4[i].length < 10) {
                    unk4[i] = unk4[i].substr(0,2)+"0"+unk4[i].substr(2);
                }

                str += unk0[i]+" ";
                str += unk4[i]+"\n";
            }
            webview.postMessage(str);
        } else {
            webview.postMessage("No matches for gfx found.");
        }
    }
    public run_gfxdis(machine_code: string) {

        const config = new DecompToolsConfiguration();
        config.init();
        const gfxdisPath = config.reconfigurate("gfxdisDir");
        const F3DType = config.config.f3d;
        const dl = config.config.displayListHead;

        const arg1 = gfxdisPath+"/gfxdis."+F3DType;

        if (!machine_code) { return; }
        
        if (machine_code.search("err") != -1) { return; }
        machine_code = machine_code.replace(/(0x)|( )/g, "");
        machine_code = machine_code.replace(/\n/g, " ");
        
        console.log(machine_code);
        const out = spawnSync("wsl", [arg1+" -g "+dl+" -d "+machine_code], {windowsVerbatimArguments: true, encoding: "utf-8"});
    
        const activeEditor = vscode.window.activeTextEditor;

        if (out.stderr) { return; } // todo: error handling
        if (activeEditor) {
            const line = activeEditor.selection.active.line;
            const char = activeEditor.selection.active.character
            const pos = new vscode.Position(line, char);
            activeEditor.edit((edit) => {
                edit.insert(pos, out.stdout);
            })
        } else {console.error("Error: No active editor")}
    }
}

class gfxdisViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = "gfxdis_webview";
	private _view?: vscode.WebviewView;
	private extensionUri: string;
	public webview: vscode.Webview | undefined;

	private context: vscode.ExtensionContext;
    private _gfxdis: gfxdis;
	constructor(
		private readonly _extensionUri: string,
		context: vscode.ExtensionContext,
        gfxdis_class: gfxdis,
	) {
		this.extensionUri = _extensionUri;
		this.context = context;
        this._gfxdis = gfxdis_class;
	 }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
                vscode.Uri.file(path.join(this.extensionUri, "/src")),
				vscode.Uri.file(path.join(this.extensionUri, "/src/modules/gfxdis")),
			]
		};

		const updateWebview = () => {
			webviewView.webview.html = viewGfxDocument();
		};

		setInterval(updateWebview, 1000);

		this.webview = webviewView.webview;

		webviewView.webview.onDidReceiveMessage(data => {
            switch(data.command) {
                case '0':
                    this._gfxdis.parse_m2c(webviewView.webview);
                    break;
                case '1':
                    this._gfxdis.run_gfxdis(data.text);
                    break;
            }
		});
	}
}
