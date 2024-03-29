# Decomp Tools

A VS Code extension allowing in-editor tools. Less setup, less terminal, and less manual typing.
Allows everyone to access and improve upon useful tools that might not otherwise be included in a decomp repository.

Specifically made for N64 decomp, but other platforms such as GC could be supported as well.

Video: https://youtu.be/5J2ZWwe3IC4  
marketplace: https://marketplace.visualstudio.com/items?itemName=MegaMech.decomptools  

## Features

* Modular design in Typescript. Anyone can add a module contributing to an efficient decomp workflow.
* Generates M2C code in a nearby panel while you decomp. This way, you always have access to the original M2C! It tracks your scope, no need for any terminal commands.
* Static DL generator
* Dynamic DL realizer. Places matched machine-code into a text box for easy manipulation prior to sending to gfxdis.
* Displays a list of funcs filtered by byte size. Only works for non-matching funcs. Ex. All funcs under 500 bytes. Helps to find all the small functions. In the future, this could contain different kinds of filters.

## Dependencies
Compile gfxdis for wsl or linux.
https://github.com/glankk/n64
[Python](https://www.python.org/downloads/)

## Compiling from source
```
npm install -g yo generator-code
```
Open the project from VS Code and press F5 to compile and create a debugging session.

## Usage
Open a workspace or folder. This is required.
Then in Settings add in the paths to gfxdis and mips2C:
`File->Preferences->Settings`
Search `Decomp Tools`

Open the Decomp Tools menu by navigating to the decomp icon on the activity bar. Click the `Begin Decomp!` button to initialize modules.  

![image](https://user-images.githubusercontent.com/7255464/175793530-a63e3541-9f97-4cf2-9973-0fff20185e33.png)


### M2C
You may need to click in and out of a function scope to get the M2C to appear. It only runs on functions that contain assembly in your decomps non_matching folder.

### gfxdis
Highlight some dynamic DLs then press `Realize Macros`. Modify the machine code generated in the textbox for it to be syntactically accurate. Next, press the `gfxdis` button to send the data to gfxdis. Its output will be pasted at your cursor position.

### gfxdismulti
A static displaylist generator. Find a .data file with DLs in it. Provide an offset with valid DLs and Decomp Tools will get gfxdis to generate C code until it hits a no op. Also converts `0x` addresses to `D_` and adds includes. Its output will be pasted at your cursor position.

### Func Size Viewer
Input a size in bytes to list any funcs that size or smaller. Only works for non_matching files that are not in extra folders.

## Configuration
The extension has a config file that auto recognizes decomps.
The extension will need to be recompiled and updated to support more decomps.
It currently has only been tested on mk64 but it has a definition for kirby.

## Future Desirable Features

* Generate CTX on startup for the m2c module
* Have a regenerate CTX button
* Display decomp progress stats on the status bar.
* Vtx dissassembly

## Known Issues

* Find small funcs does not support opening files in folders of folders:
`ex. asm/non_matchings/audio/external/external.c.`
It must be:
`asm/non_matchings/external/external.c`


## Contributing

PRs Welcome.
