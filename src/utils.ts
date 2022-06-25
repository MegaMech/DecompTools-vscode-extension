// General utility funcs that may be useful in more than one module.

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { resolve } from 'path';
import { readdir } from 'fs/promises';


/**
 * 
 * Three funcs work together recursively to get directories in a directory
 * 
 **/
function flatten(lists: any) {
    return lists.reduce((a:string, b:string) => a.concat(b), []);
}
  
function getDirectories(srcpath: any) {
    return fs.readdirSync(srcpath)
    .map(file => path.join(srcpath, file))
    .filter(path => fs.statSync(path).isDirectory());
}

function getDirectoriesRecursive(srcpath: any): any {
    return [srcpath, ...flatten(getDirectories(srcpath).map(getDirectoriesRecursive))];
}

/**
 * Gets all files recursively using async pointers.
 * @param dir Directory path
 */
async function *getFiles(dir: string): AsyncGenerator<string> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const res = resolve(dir, entry.name);
        if (entry.isDirectory()) {
            yield* getFiles(res);
        } else {
            yield res;
        }
    }
}

/** getFiles call implementation */
/*
;(async () => {
    for await (const f of utils.getFiles(config.config.nonmatching)) {
        fs.stat(f, (err, stats) => {
            if (err) console.error(err);

            if (stats.size <= 3000) {
                const fileName = f.match(/[ \w-]+?(?=\.)/);
                this.funcs?.push(String(fileName));
            }
        });
        
    }
})()
*/

export {getDirectories, getDirectoriesRecursive, flatten, getFiles}