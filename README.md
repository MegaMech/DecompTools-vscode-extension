# Decomp Tools

A VS Code extension allowing in-editor tools. Less setup, less terminal, and less manual typing.
Allows everyone to access and improve upon useful tools that might not otherwise be included in a decomp repository.

Specifically made for N64 decomp, but other platforms such as GC could be supported as well.

## Features

* Modular design in Typescript. Anyone can add a module contributing to an efficient decomp workflow.
* Generates M2C code in a nearby panel while you decomp. This way, you always have access to the original M2C! It tracks your scope, no need for any terminal commands.
* Static DL generator
* Dynamic DL helper
* Displays a filtered tree view of non-matching funcs of byte size. This helps devs decomp the small functions first. In the future, this could contain many filters.

## Dependencies
Compile gfxdis for Windows
https://github.com/glankk/n64
## Install
Install the extension. (I haven't gotten that far yet)


## Compiling from source
Open the project from VS Code and press F5 to compile and create a debugging session.

## Usage
Open the Decomp Tools menu by navigate to the decomp icon on the activbity bar. Click the `Begin Decomp!` button to initialize modules.

### M2C
You may need to click in and out of a function scope to get the M2C to appear. It only runs on functions that contain assembly in your decomps non_matching folder.

### gfxdis
Highlight some dynamic DLs. Press the "Convert" button. The textarea will display the machine-code. It will require some fixing up but it gets you most of the way. Then press "gfxdis" to generate the C code.

### gfxdismulti
A static displaylist generator. Find a .data file with DLs in it. Provide an offset with valid DLs and Decomp Tools will get gfxdis to generate C code until it hits a no op. Also converts `0x` addresses to `D_` and adds includes.

### Func Size Counter
Input a number. It will list any funcs smaller than that. Only works for non_matching files.

## Configuration
File->Preferences->Settings

Search "Decomp Tools". Make sure to input the non_matching directory, asm, etc.
Different decomps lay their code out differently.

Todo: Recognize decomps and set this up automatically

## Future Desirable Features

* Generate CTX on startup for the m2c module
* Have a regenerate CTX button
* Display decomp stats on the status bar.

## Todo
* Project directory has entire path then the other settings are just `src/` then in code we chain the two settings together.

### Find small funcs
* Fix bug that shows empty folders.
* Display how many funcs were found.
* Onclick open file.

* When clicked, ui buttons should imitate the blue outline of vs code buttons.

## Known Issues

The M2C module doesn't start working immediately without prior input and some messing about.

## Contributing

PRs Welcome.
