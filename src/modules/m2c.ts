import * as vscode from 'vscode';
import * as path from 'path';
import { DecompToolsConfiguration } from "./configuration";
import { OutgoingMessage } from 'http';

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
        if ( Symbol.iterator in Object(documentSymbols)) { 
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
    }

    private async runm2c(symbol: string, activeEditor: vscode.TextEditor, handler: m2cOutput, ondid: vscode.EventEmitter<vscode.Uri>, uri: vscode.Uri) {
        const fileName = activeEditor.document.fileName.match(/[ \w-]+?(?=\.)/);
        const config = new DecompToolsConfiguration();
        config.init();
        const m2cPath = config.reconfigurate("m2cDir");
        const nonMatchingPath = config.config.nonmatchingDir;
        const asmPath = config.config.asmDir;
        const projectPath = config.getWorkingPath();
        const cp = require('child_process')

        const args = "py "+path.normalize(m2cPath+"/m2c.py")+" "+path.normalize(projectPath+"/"+asmPath+"/"+nonMatchingPath+"/"+fileName+"/"+symbol+".s")+" -f "+symbol;

        if (projectPath == "ERROR") {
            handler.data = "Error: You must be in a workspace or folder to use Decomp Tools.";
            ondid.fire(uri);
            return;
        }
        
        if (this.view == undefined) {
            // todo: Handle shutdown/recreating the text editor panel.
            // This likely needs to go somewhere else.
            // Undefined doesn't work like this
            //console.log(this.view)
            //console.error("Cannot find view for M2C, did you close the texteditor window?");
            
        }
        try {
            const out = cp.execSync(args, {encoding: "utf-8"});
            handler.data = String(out);
            ondid.fire(uri);
        }
        catch (err) {
            const msg = "Error or nothing to decomp.\nCan only run m2c on files that have assembly in\n"+asmPath+"/"+nonMatchingPath+" \
            \nMake sure the code file name matches the code folder name:\n \
            "+asmPath+"/"+nonMatchingPath+"/code_file_name/asm_func.s";
            handler.data = msg+"\n\n"+String(err);
            ondid.fire(uri);
            //console.error(err);
            //console.error("m2c terminal command failed!");
            return;
        }
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