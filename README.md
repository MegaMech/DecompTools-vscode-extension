# Decomp Tools

A VS Code extension allowing in-editor tools. Less setup, less terminal, and less manual typing.
Allows everyone to access and improve upon useful tools that might not otherwise be included in a decomp repository.

Specifically made for N64 decomp, but other platforms such as GC could be supported as well.

## Features

Modular design in Typescript. Anyone can add a module contributing to an efficient decomp workflow.

Generates M2C code in a nearby panel while you decomp. This way, you always have access to the original M2C! It tracks your scope, no need for any terminal commands.

[wip]
Displays a filtered tree view of non-matching funcs of byte size. This helps devs decomp the small functions first. In the future, this could contain many filters.

## Usage
Install the extension. (I haven't gotten that far yet)

From source:  

press F5 after loading the project in VS Code to compile and create a debugging session.

Ctrl+Shift+P and clicking "Hello world" runs the hello world command and initializes the M2C module. You may need to click in and out of a function scope to get the M2C to appear. This currently only works on functions that contain assembly.

## Configuration
File->Preferences->Settings

Search "Decomp Tools". Make sure to input the non_matching directory, asm, etc.
Different decomps lay their code out differently.

Todo: Recognize decomps and set this up automatically

## Future Desirable Features

* Generate CTX on startup for the m2c module
* Have a regenerate CTX button
* Highlighting dynamic DLs will attempt to auto convert them to gfxdis bytecode in an editable panel. When the byte-code looks good pressing enter will paste gfxdis at your cursor.
* Static DLs auto pasting the code into the text editor after providing a bin file and offset.

## Todo
* Project directory has entire path then the other settings are just `src/` then in code we chain the two settings together.

* Fix bug in `Find funcs with length` to not show empty folders.
* Display how many funcs were found.
* Onclick open file.

## Known Issues

The M2C module doesn't start working immediately without prior input and some messing about.

## Contributing

PRs Welcome.
