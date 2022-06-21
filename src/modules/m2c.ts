import * as vscode from 'vscode';
import { DecompToolsConfiguration } from "./configuration";

export class m2c {
    private text?: vscode.TextEditor;
    private funcName?: string;
    private view?: vscode.Webview;
    public m2cDocument: vscode.Uri;
    private onDidChange = new vscode.EventEmitter<vscode.Uri>();
    private oldLine: number;
    private oldFunc: string;

    public textEventHandler: m2cOutput;

    constructor(view?: vscode.Webview) {
        this.view = view;
        this.textEventHandler = new m2cOutput();
        this.m2cDocument = vscode.Uri.parse("Mips 2 C").with({scheme: "m2cScheme"});
        this.oldLine = 1;
        this.oldFunc = "";
    }
    
    async init(context: vscode.ExtensionContext) {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor == undefined) { return; }
        this.oldLine = activeEditor.selection.active.line;

        const provider = new customTextDocumentProvider(context.extensionPath, "", this.textEventHandler, this.onDidChange);
	
	
        context.subscriptions.push(
		    vscode.workspace.registerTextDocumentContentProvider("m2cScheme", provider));


        setInterval(()=>this.FindCurrentScope(), 500); // If 500ms isn't snappy enough, lower this number.     
        
        vscode.workspace.openTextDocument(this.m2cDocument).then(
            doc => vscode.languages.setTextDocumentLanguage(doc, "c").then(
            docu => vscode.window.showTextDocument(docu, 
                {
                    selection: new vscode.Range(1, 1, 2, 2),
                    viewColumn: vscode.ViewColumn.Beside,
                    preview: false,preserveFocus: true
                }
        ))); 
    }

    async FindCurrentScope() {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor == undefined) { return; }
        if (this.oldLine == activeEditor.selection.active.line) { return; }

        const documentSymbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', activeEditor.document.uri);

        for (const item of documentSymbols) {
            if (item.range.contains(activeEditor.selection.active)) {
                let symbol = item.name.replace(/\(.*$/, "");

                if (this.oldFunc == symbol) { return; };

                await this.runm2c(symbol, activeEditor, this.textEventHandler, this.onDidChange, this.m2cDocument);

                this.oldFunc = symbol;
                this.oldLine = activeEditor.selection.active.line;
                break;
            }
        }
    }

    private async runm2c(symbol: string, activeEditor: vscode.TextEditor, handler: m2cOutput, ondid: vscode.EventEmitter<vscode.Uri>, uri: vscode.Uri) {
        const fileName = activeEditor.document.fileName.match(/[ \w-]+?(?=\.)/);

        const config = new DecompToolsConfiguration();
        const m2cPath = config.reconfigurate("m2c");
        const nonMatchingPath = config.reconfigurate("nonmatchingFolder");
        const cp = require('child_process')

        const args = "py "+m2cPath+"\\m2c.py "+nonMatchingPath+"/"+fileName+"/"+symbol+".s"+" -f "+symbol;

        cp.exec(args, (err:string, stdout:string, stderr:any) => {
            if (this.view == undefined) {
                // todo: Handle shutdown/recreating the text editor panel.
                // This likely needs to go somehwere else.
            }
            if (err) {
                handler.data = err;
                ondid.fire(uri);

                return;
            }
            handler.data = stdout;
            ondid.fire(uri);
        });

    }

}

export class customTextDocumentProvider implements vscode.TextDocumentContentProvider {
	private extensionUri;

    static scheme = 'm2cScheme';

	private _onDidChange: vscode.EventEmitter<vscode.Uri>;
    //private _subscriptions: vscode.Disposable;

    constructor(
		private readonly _extensionUri: string,
        private doc: string,
        private textEventHandler: m2cOutput,
        private ondid: vscode.EventEmitter<vscode.Uri>,
	) {
		this.extensionUri = _extensionUri;
        this.textEventHandler = textEventHandler;
        this._onDidChange = ondid;
        //this._subscriptions = vscode.workspace.onDidCloseTextDocument(doc => this._documents.delete(doc.uri.toString()));

	}

    dispose() {
		this._onDidChange.dispose();
	}
    
    get onDidChange() {
        return this._onDidChange.event;
	}

    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {    
        return this.textEventHandler.data;
    }
}

export class m2cOutput {

    public data: string;
    constructor() {
        this.data = "";
    }
}