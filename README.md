# Cortex Builder

![Front](https://raw.githubusercontent.com/7bnx/Cortex-Builder/master/resources/media/Front.png)

This [extension](https://marketplace.visualstudio.com/items?itemName=semyon-ivanov.cortex-builder) generates files for **VSCode** to write, build and debug code for cortex controllers with Arm GCC Toolchain and make tool. List of supported controllers, svd, include files are presented in the [repo](https://github.com/7bnx/Cortex-Builder-Essentials).

> **WARNING**: Tested with Windows 10 only!

## Support

If you like this extension, you could support its development

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/7bnx)


## Features
 - Automatically download svd, core, include (Keil's version) files
 - Documentation for supported controllers
 - Tools: j-link, st-link
 - Debug servers: j-link, openOCD
 - Output: hex, bin, elf
 - No need external IDE
 - C/CPP project type
 - [Cortex-debug](https://marketplace.visualstudio.com/items?itemName=marus25.cortex-debug) configuration
 - A lot of essential settings(standard, optimization...)
 - Buttons: Build/Clean/Flash/Erase/Reset/Debug/New Project/Settings
  
    ![MenuBar](https://raw.githubusercontent.com/7bnx/Cortex-Builder/master/resources/media/MenuBar.gif)

## Release Notes

### 1.0.5

##### Changes

  - Cortex Builder Tree
      - Replaced names of operations with files (create new file, delete file) to corresponding icons

##### Fixes 

 - Documentation:
     - Starts with last viewed page, when VSCode was closed and reopened

### 1.0.4

##### Features

 - Documentation
     - Added Pdf.JS
     - Controllers documentation will be automaticcaly added to the new projects
 - Busy bar for long-time operation (new project, save settings)

##### Changes

  - OpenOCD
     - Changed path. The new one should point to directory with folders *target* and *interface*
     
### 1.0.3

##### Improvements

 - openeOCD
     - Remove 'reset' of target after erase
     - Add echo 'Done'

##### Fixes 

 - Jlink:
     - Fixed issue of jlink with openOCD (Flash, Erase, Reset)

## Usage

### New Project
0. Make sure to match all [Requirements](#Requirements)
1. Open new VSCode window with any document(for example - *Welcome page*)
2. Press New Project button
3. Select controller
4. Choose folder and project name
5. Open project
6. For the first launch: add path to the *compiler* (e.g.: `.../bin/arm-none-eabi-gcc-9.3.1.exe`) and path (if needed ) to *openOCD*'s folders(target and interface) in the project settings. 

### Add Source
1. Click *Source -> New* in the *Cortex Builder* explorer
2. Select type of source
3. Type a name
 
The new file will be saved in `.../projectRootFolder/user/`

![Add Source](https://raw.githubusercontent.com/7bnx/Cortex-Builder/master/resources/media/AddSource.gif)



## Requirements
- **VSCode extensions:**
    - [Cortex-debug](https://marketplace.visualstudio.com/items?itemName=marus25.cortex-debug) by marus25
    - [C/C++ extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools)
- [**Arm GCC Toolchain**](https://github.com/xpack-dev-tools/arm-none-eabi-gcc-xpack/releases/);
- **Make tool:**
    - [Windows Build Tools](https://github.com/xpack-dev-tools/windows-build-tools-xpack/releases)
- **Debugger server:**
    - [j-link](https://www.segger.com/downloads/jlink/#J-LinkSoftwareAndDocumentationPack) or [openOCD](https://gnutoolchains.com/arm-eabi/openocd/)

Add the next paths to the Windows PATH environment variable:
1. arm gcc toolchain *`...\bin`*
2. make tool *`...\bin`*
3. debugger server: *root folder* for j-link or *`...\bin`* for openOCD
## Tested conditions

Extension was tested with the followings parameters:

- **OS**:
    - *Windows 10*;
- **Arm GCC Toolchain:**
    - *9.3.1*;
    - *9.2*
    - *8.3.1*
- **Make:**
    - Windows Build Tools:
        - *2.12 (GNU Make 4.2.1)*
- **Debugging server:**
    - *j-link v.6.50a*
    - *openOCD 0.10.0 (2020-07-01)*
- **Tool:**
    - *J-link(swd)*
    - *ST-Link V2*
