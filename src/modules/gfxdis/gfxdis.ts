import { spawnSync } from 'child_process';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class gfxdis {

    public init(context: vscode.ExtensionContext) {
        const provider = new gfxdisViewProvider(context.extensionPath, context, this);
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(gfxdisViewProvider.viewType, provider));
    }

    public parse_m2c() {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor == undefined) { return; }

        let start = activeEditor.selection.start;
        let end = activeEditor.selection.end;

        let highlight = activeEditor.document.getText(new vscode.Range(start, end));

        let unk0 = highlight.match(/(?<=->unk0 = ).*/g);
        let unk4 = highlight.match(/(?<=->unk4 = ).*/g);
        
        let str = "";
        console.log("Running gfxdis");

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
            console.log(str);
        } else {
            console.error("No matches for gfx found.");
        }
    }
    public run_gfxdis(machine_code: string) {
        //const out = spawnSync("wsl", [arg1+" -d "+machine_code+" -a 0x"+(offset+startOffset).toString(16).toUpperCase()], {windowsVerbatimArguments: true, encoding: "utf-8"});
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

		
		let html = fs.readFileSync(vscode.Uri.file(path.join(this.extensionUri, "src/modules/gfxdis/gfxdis.html")).with({scheme: 'vscode-resource'}).fsPath, "utf-8");
		
		const pathToCSS = vscode.Uri.file(path.join(this.extensionUri, 'src/ui.css'));
		html = html.replace("{{pathCSS}}", String(webviewView.webview.asWebviewUri(pathToCSS)));

		const updateWebview = () => {
			webviewView.webview.html = html
		};

		setInterval(updateWebview, 1000);

		this.webview = webviewView.webview;

		webviewView.webview.onDidReceiveMessage(data => {
            switch(data.command) {
                case 0:
                    this._gfxdis.parse_m2c();
                    break;
                case 1:
                    this._gfxdis.run_gfxdis(data.text);
                    break;
            }
		});
	}
}
