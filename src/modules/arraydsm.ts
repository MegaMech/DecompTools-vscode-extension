import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { DecompToolsConfiguration } from './configuration';

/**
 * Converts data, vtx, etc. to array.
 * 
 * Issue: Data can be very different. Vtx makes sense to auto decomp
 * Having users alter the output is a bit too complex.
 * How should the user input it? Parsing the options.
 * The UI of vscode isn't quite made for this and modifying your own script might be easier.
 * 
 **/
export function arraydsm(binFile: string, startOffset: number, symbol: string) {
    const config = new DecompToolsConfiguration();
    config.init();

    const projFolder = config.reconfigurate("projectPath");
    const projFolderWSL = config.reconfigurate("projectPathWSL");
    const binFolder = config.config.binDir;

    if (!binFile || !startOffset || !symbol) { return; }

    const fileToOpen = projFolder+"\\"+binFolder+"\\"+binFile;

    const f = fs.readFileSync(path.normalize(fileToOpen), { encoding: 'binary', flag: 'r'});
    let buf = Buffer.from(f, "binary");

    let maxIterations = 200;
    for (let i = 0; i < maxIterations; i++) {
        //buf.readBigInt64BE()
        //offset += 8;
    }

    // End of ui.html
    /*
            <br>
        <input class="gfxdisInput" id="arraydsmFile" placeholder="Binary File"></input><br>
        <input class="gfxdisInput" id="arraydsmFileSym" placeholder="Symbol Name"></input><br>
        <input class="gfxdisInput" id="arraydsmFileOffset" placeholder="Start Offset"></input>
        <button onclick="run_func(3)" style="margin-bottom: 5px;">arraydsm</button>
    */
}