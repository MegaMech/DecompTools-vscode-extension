// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { funcSizeCounter } from './modules/funcSizeCounter';
import { m2c } from './modules/m2c';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	const _init_modules = new init_modules();

	const provider = new customViewProvider(context.extensionPath);
	
	_init_modules.init(context);
	
    context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(customViewProvider.viewType, provider));
		
		// The command has been defined in the package.json file
		// Now provide the implementation of the command with registerCommand
		// The commandId parameter must match the command field in package.json
		let disposable = vscode.commands.registerCommand('decomp.helloWorld', () => {
			// The code you place here will be executed every time your command is executed
			// Display a message box to the user
		//provider.webview.html = fs.readFileSync(this._extensionUri, 'utf8');

		vscode.window.showInformationMessage('Welcome Back. Happy Decomping!');
	});

	context.subscriptions.push(disposable);

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

class customViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = "decomp_webview";
	private _view?: vscode.WebviewView;
	private extensionUri: string;
	public webview: vscode.Webview | undefined;
	constructor(
		private readonly _extensionUri: string,
	) {
		this.extensionUri = _extensionUri;
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

		
		let html = fs.readFileSync(vscode.Uri.file(path.join(this.extensionUri, "src/ui.html")).with({scheme: 'vscode-resource'}).fsPath, "utf-8");
		
		const pathToCSS = vscode.Uri.file(path.join(this.extensionUri, 'src/ui.css'));
		html = html.replace("{{pathCSS}}", String(webviewView.webview.asWebviewUri(pathToCSS)));

		const updateWebview = () => {
			webviewView.webview.html = html
		};

		setInterval(updateWebview, 1000);

		this.webview = webviewView.webview;

		webviewView.webview.onDidReceiveMessage(data => {

			switch (data.command) {
				case '0':
						const funcSizeCounte = new funcSizeCounter();
						funcSizeCounte.init_count(100); 
						break;
			}
		});
	}
}