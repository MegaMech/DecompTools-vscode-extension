// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { funcSizeCounter } from './modules/funcSizeCounter';
import { m2c } from './modules/m2c';
import { gfxdismulti } from './modules/gfxdismulti';
import { gfxdis } from './modules/gfxdis/gfxdis';
import { DecompToolsConfiguration } from './modules/configuration';
import { mk64 } from './decomp_config';
import { arraydsm } from './modules/arraydsm';
import { viewDocument } from './ui.html';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const provider = new customViewProvider(context.extensionPath, context);
	
    context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(customViewProvider.viewType, provider));

	const gfxdisRef = new gfxdis();
	gfxdisRef.init(context);
}
	
export function InitExtension(context: vscode.ExtensionContext) {
	const _init_modules = new init_modules();
	_init_modules.init(context);
	vscode.window.showInformationMessage('Welcome Back. Happy Decomping!');
}

// this method is called when your extension is deactivated
export function deactivate() {}


var init = false;
export class init_modules {
	private m:m2c;
	private didInit = false;
	constructor(view?: vscode.Webview) {
		this.m = new m2c(view);
	}
	init(context: vscode.ExtensionContext) {
		this.didInit = true;

		this.m.init(context);
	}
}
let init2 = false;
export class init_modules2 {
	private m:funcSizeCounter;
	private didInit = false;
	constructor() {
		this.m = new funcSizeCounter();
	}
	init(size: number) {
		
		if (!init2) {
			init2 = true;
			this.m.init_count(size);
		}
		if (init2) {
			this.m.update(size);
		}
	}
}
class customViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = "decomp_webview";
	private _view?: vscode.WebviewView;
	private extensionUri: string;
	public webview: vscode.Webview | undefined;
	private funcSizeCount: init_modules2;
	private context: vscode.ExtensionContext;
	constructor(
		private readonly _extensionUri: string,
		context: vscode.ExtensionContext,
	) {
		this.extensionUri = _extensionUri;
		this.funcSizeCount = new init_modules2();
		this.context = context;
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
			]
		};

		
		//let html = fs.readFileSync(vscode.Uri.file(path.join(this.extensionUri, "src/ui.html")).with({scheme: 'vscode-resource'}).fsPath, "utf-8");
		
		//const pathToCSS = vscode.Uri.file(path.join(this.extensionUri, 'src/ui.css'));
		//html = html.replace("{{pathCSS}}", String(webviewView.webview.asWebviewUri(pathToCSS)));

		const updateWebview = () => {
			webviewView.webview.html = viewDocument();
		};

		setInterval(updateWebview, 1000);

		this.webview = webviewView.webview;

		webviewView.webview.onDidReceiveMessage(data => {

			switch (data.command) {
				case '0':
					InitExtension(this.context);
					break;
				case '1':
					let a: number;
					try {
						a = Number(data.text);
					} catch {
						throw "Bad find funcs with length input"
					}
					this.funcSizeCount.init(data.text);
					break;
				case '2':
					const arr = JSON.parse(data.text);
					//try {
						gfxdismulti(arr[0], parseInt(arr[1], 16), arr[2]);
					//}
					//catch {console.error("Error: Bad user input")}
				case '3':
					const arra = JSON.parse(data.text);
					arraydsm(arra[0], parseInt(arra[1], 16), arra[2]);
			}
		});
	}
}