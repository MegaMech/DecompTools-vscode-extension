import * as vscode from 'vscode';
import { DecompToolsConfiguration } from "./configuration";
import * as fs from 'fs';
import { Buffer } from 'node:buffer';
import * as path from 'path';
import { openStdin } from 'process';
import { platform } from 'os';

/**
 * gfxdismulti decomps static DLs to matching C code.
 */
export async function gfxdismulti(binFile: string, startOffset: number, symbol: string) {
    const { spawnSync, execSync } = require('child_process');

    const config = new DecompToolsConfiguration();
    config.init();
    const projFolder = config.getWorkingPath();
    
    let projFolderEscaped = projFolder;
    if (projFolder.search(/\\\\/) == -1 && platform() == "win32") {
        projFolderEscaped = projFolder.replace(/(?<!\\)\\(?!\\)/g, "\\\\");
    }
    let projFolderWSL;
    if (platform() == "win32") {
        projFolderWSL = execSync("wsl wslpath "+projFolderEscaped, {encoding: "utf-8"});
        projFolderWSL = projFolderWSL.replace(/[\n\r]/g, "");
    } else {
        projFolderWSL = projFolderEscaped;
    }
    
    const binFolder = config.config.binDir;
    const gfxdisPath = config.reconfigurate("gfxdisDir");
    const F3DType = config.config.f3d;

    if (!binFile || !startOffset || !symbol) { return; }

    const fileToOpen = projFolder+"\\"+binFolder+"\\"+binFile;
    const fileToOpenWSL = projFolderWSL+"/"+binFolder+"/"+binFile;

    const arg2WSL = fileToOpenWSL; 
    const arg1 = gfxdisPath+"/gfxdis."+F3DType;

    const f = fs.readFileSync(path.normalize(fileToOpen), { encoding: 'binary', flag: 'r'});
    let buf = Buffer.from(f, "binary");

    let iterations = 100 * 2 // maxIterations and totalIterations
    let offset = 0;
    let str = "";


    /**
     * Inserts gfxdis output into a string.
     * While loop searches for next addr to run gfxdis at.
     * If gfxdis outputs a no op the func completes.
     **/
    for (let i = 0; i < iterations; i++) {
        const out = spawnSync("wsl", [arg1+" -f "+arg2WSL+" -a 0x"+(offset+startOffset).toString(16).toUpperCase()], {windowsVerbatimArguments: true, encoding: "utf-8"});
        if (out.stderr) {console.error(out.stderr); return;}

        if (out.stdout.search(/gsSPNoOp\(\)/) != -1) {
            iterations = i;
            break;
        }
        str += "Gfx "+symbol+"_"+offset.toString(16).toUpperCase()+"[] = {\n"
        str += out.stdout;
        str += "\n";

        let gfx = buf.readBigInt64BE(offset+startOffset);
        do {
            offset += 8;
            gfx = buf.readBigInt64BE(offset+startOffset);
            //                          gsSPEndDisplayList()
        } while (BigInt(gfx) != BigInt(-5188146770730811392));
        offset += 8;
    }

    // According to MozDocs the `$1` regex var only works if you create the RegExp object.
    const regex = new RegExp(/0x([0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F])/g);
    str = str.replace(regex, "D_$1");

    const inc = str.match(/D_[0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F][0-9A-F]/g);
    if (inc) {
        let text = "";
        for(let item of inc) {
            text += "extern Gfx "+item+"[];\n";
        }
        text += "\n\n"
        str = text + str;
    }

    str += "// Program exited at: 0x"+(offset+startOffset).toString(16)+"\n";
    str += "// todo: Check this actually outputs hex and not decimal.\n";
    str += "// gfxdis ran "+iterations+" times.\n"
    
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        const line = activeEditor.selection.active.line;
        const char = activeEditor.selection.active.character
        const pos = new vscode.Position(line, char);
        activeEditor.edit((edit) => {
            edit.insert(pos, str);
        })
    } else {console.error("Error: No active editor")}
}
