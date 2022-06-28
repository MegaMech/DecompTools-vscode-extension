export interface decomp_config {
    ld: string;
    f3d: string;
    asmDir: string;
    nonmatchingDir: string;
    srcDir: string;
    toolsDir: string;
    binDir: string;
    mapPath: string;
    displayListHead: string;
    extension: string;
}

export class mk64 implements decomp_config {
    ld: string;
    f3d: string;
    asmDir: string;
    nonmatchingDir: string;
    srcDir: string;
    toolsDir: string;
    binDir: string;
    mapPath: string;
    displayListHead: string;
    extension: string;
    constructor() {
        this.ld = "mk64.ld";
        this.f3d = "f3dex";
        this.asmDir = "asm";
        this.nonmatchingDir = "non_matchings";
        this.srcDir = "src";
        this.toolsDir = "tools";
        this.binDir = "bin";
        this.mapPath = "build/us/mk64.us.map";
        this.displayListHead = "gDisplayListHead++";
        this.extension = ".c";
    }
}

export class kirby implements decomp_config {
    ld: string;
    f3d: string;
    asmDir: string;
    nonmatchingDir: string;
    srcDir: string;
    toolsDir: string;
    binDir: string;
    mapPath: string;
    displayListHead: string;
    extension: string;
    constructor() {
        this.ld = "kirby.us.ld";
        this.f3d = "f3dex";
        this.asmDir = "asm";
        this.nonmatchingDir = "non_matchings";
        this.srcDir = "src";
        this.toolsDir = "tools";
        this.binDir = "bin";
        this.mapPath = "build/us/kirby.us.map";
        this.displayListHead = "gDisplayListHead++";
        this.extension = ".c";
    }
}