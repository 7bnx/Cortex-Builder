"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Get = exports.ChangeHeapSize = exports.ChangeStackSize = exports.ChangeFlashStart = exports.Replace = exports.New = void 0;
const fs = require("fs");
const vscode = require("vscode");
const path = require("path");
const fileName = "Linker.ld";
const filePath = path.join((vscode.workspace.rootPath === undefined) ? "" : vscode.workspace.rootPath);
const fullPath = path.join(filePath, fileName);
function New(projectPath, controller) {
    Replace(controller.ramStart, controller.flashStart, controller.ramEnd, controller.ramSizeK, controller.flashSizeK, controller.heapSize, controller.stackSize, projectPath);
}
exports.New = New;
function Replace(ramStart, flashStart, ramEnd, ramSize, flashSize, heapSize, stackSize, projectPath = filePath) {
    let data = `
/*-----------------------------------------------------------------------------------
#	  Generated by Cortex-Builder extension fo Visual Studio code
#	  Author: Semyon Ivanov
#	  e-mail: agreement90@mail.ru 
#	  repo: https://github.com/7bnx/Cortex-Builder
/*---------------------------------------------------------------------------------*/


/*---------------------------------------------------------------------------------*/
/*	Entry Point*/
/*---------------------------------------------------------------------------------*/
ENTRY(Reset_Handler)
/*---------------------------------------------------------------------------------*/
/*	End of Entry Point*/
/*---------------------------------------------------------------------------------*/


/*---------------------------------------------------------------------------------*/
/*	Defines*/
/*---------------------------------------------------------------------------------*/
STARTRAM = ${ramStart};
STARTFLASH = ${flashStart};
ENDRAM = ${ramEnd};
LENGTHRAM = ${ramSize};
LENGTHFLASH = ${flashSize};
HEAPSIZE = ${heapSize};
STACKSIZE = ${stackSize};
/*---------------------------------------------------------------------------------*/
/*	End of Defines*/
/*---------------------------------------------------------------------------------*/


/*---------------------------------------------------------------------------------*/
/*	Memory Area*/
/*---------------------------------------------------------------------------------*/
MEMORY
{
  RAM (xrw):	ORIGIN = STARTRAM, LENGTH = LENGTHRAM
  FLASH (rx):	ORIGIN = STARTFLASH, LENGTH = LENGTHFLASH
}
/*---------------------------------------------------------------------------------*/
/*	End of Memory Areas*/
/*---------------------------------------------------------------------------------*/


/*---------------------------------------------------------------------------------*/
/*	Output Sections*/
/*---------------------------------------------------------------------------------*/
SECTIONS
{
/*---------------------------------------------------------------------------------*/
/*	1. ISR section*/
/*---------------------------------------------------------------------------------*/
  .isr_vector :
  {
    . = ALIGN(4);
    KEEP(*(.isr_vector))
    . = ALIGN(4);
  } >FLASH
/*---------------------------------------------------------------------------------*/
/*	End of ISR Section*/
/*---------------------------------------------------------------------------------*/


/*---------------------------------------------------------------------------------*/
/*	2. Text section*/
/*---------------------------------------------------------------------------------*/
  .text :
  {
    . = ALIGN(4);
    *(.text)
    *(.text*)
    *(.glue_7)
    *(.glue_7t)
    *(.eh_frame)

    KEEP(*(.init))
    KEEP(*(.fini))

    . = ALIGN(4);
    _etext = .;
  } >FLASH
/*---------------------------------------------------------------------------------*/
/*	End of Text Section*/
/*---------------------------------------------------------------------------------*/


/*---------------------------------------------------------------------------------*/
/*	3. rodata section*/
/*---------------------------------------------------------------------------------*/
  .rodata :
  {
    . = ALIGN(4);
    *(.rodata)
    *(.rodata*)
    . = ALIGN(4);
  } >FLASH
/*---------------------------------------------------------------------------------*/
/*	End of rodata Section*/
/*---------------------------------------------------------------------------------*/


/*---------------------------------------------------------------------------------*/
/*	4. ARMEXTAB section*/
/*---------------------------------------------------------------------------------*/
  .ARM.extab :
  {
    *(.ARM.extab* .gnu.linkonce.armextab.*)
  } >FLASH
/*---------------------------------------------------------------------------------*/
/*	End of ARMEXTAB Section*/
/*---------------------------------------------------------------------------------*/


/*---------------------------------------------------------------------------------*/
/*	5. ARM section*/
/*---------------------------------------------------------------------------------*/
  .ARM :
  {
    __exidx_start = .;
    *(.ARM.exidx*)
    __exidx_end = .;
  } >FLASH
/*---------------------------------------------------------------------------------*/
/*	End of ARM Section*/
/*---------------------------------------------------------------------------------*/


/*---------------------------------------------------------------------------------*/
/*	6. preinit_array section*/
/*---------------------------------------------------------------------------------*/
  .preinit_array :
  {
    PROVIDE_HIDDEN (__preinit_array_start = .);
    KEEP (*(.preinit_array*))
    PROVIDE_HIDDEN (__preinit_array_end = .);
  } >FLASH
/*---------------------------------------------------------------------------------*/
/*	End of preinit_array Section*/
/*---------------------------------------------------------------------------------*/


/*---------------------------------------------------------------------------------*/
/*	7. init_array section*/
/*---------------------------------------------------------------------------------*/
  .init_array :
  {
    PROVIDE_HIDDEN (__init_array_start = .);
    KEEP (*(SORT(.init_array.*)))
    KEEP (*(.init_array*))
    PROVIDE_HIDDEN (__init_array_end = .);
  } >FLASH
/*---------------------------------------------------------------------------------*/
/*	End of init_array Section*/
/*---------------------------------------------------------------------------------*/


/*---------------------------------------------------------------------------------*/
/*	8. fini_array section*/
/*---------------------------------------------------------------------------------*/
  .fini_array :
  {
    PROVIDE_HIDDEN (__fini_array_start = .);
    KEEP (*(SORT(.fini_array.*)))
    KEEP (*(.fini_array*))
    PROVIDE_HIDDEN (__fini_array_end = .);
  } >FLASH
/*---------------------------------------------------------------------------------*/
/*	End of fini_array Section*/
/*---------------------------------------------------------------------------------*/


/*---------------------------------------------------------------------------------*/
/*	9. data section*/
/*---------------------------------------------------------------------------------*/
  _sidata = LOADADDR(.data);
  .data :
  {
    . = ALIGN(4);
    _sdata = .;
    *(.data)
    *(.data*)
    . = ALIGN(4);
    _edata = .;
  } >RAM AT> FLASH
/*---------------------------------------------------------------------------------*/
/*	End of data Section*/
/*---------------------------------------------------------------------------------*/


/*---------------------------------------------------------------------------------*/
/*	10. bss section*/
/*---------------------------------------------------------------------------------*/
  . = ALIGN(4);
  .bss :
  {
    _sbss = .;
    __bss_start__ = _sbss;
    *(.bss)
    *(.bss*)
    *(COMMON)

    . = ALIGN(4);
    _ebss = .;
    __bss_end__ = _ebss;
  } >RAM
/*---------------------------------------------------------------------------------*/
/*	End of bss Section*/
/*---------------------------------------------------------------------------------*/


/*---------------------------------------------------------------------------------*/
/*	11. User Heap section*/
/*---------------------------------------------------------------------------------*/
  ._user_heap_stack :
  {
    . = ALIGN(8);
    PROVIDE ( end = . );
    PROVIDE ( _end = . );
    . = . + HEAPSIZE;
    . = . + STACKSIZE;
    . = ALIGN(8);
  } >RAM
/*---------------------------------------------------------------------------------*/
/*	End of User Heap Section*/
/*---------------------------------------------------------------------------------*/


/*---------------------------------------------------------------------------------*/
/*	12. DISCARD section*/
/*---------------------------------------------------------------------------------*/
  /DISCARD/ :
  {
    libc.a ( * )
    libm.a ( * )
    libgcc.a ( * )
  }
/*---------------------------------------------------------------------------------*/
/*	End of DISCARD Section*/
/*---------------------------------------------------------------------------------*/


/*---------------------------------------------------------------------------------*/
/*	13. ARM Attributes section*/
/*---------------------------------------------------------------------------------*/
  .ARM.attributes 0 :
  {
    *(.ARM.attributes)
  }
/*---------------------------------------------------------------------------------*/
/*	End of ARM Attributes Section*/
/*---------------------------------------------------------------------------------*/
}
/*---------------------------------------------------------------------------------*/
/*	End of Output Sections*/
/*---------------------------------------------------------------------------------*/`;
    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
    }
    fs.writeFile(path.join(projectPath, fileName), data, () => { });
}
exports.Replace = Replace;
function ChangeFlashStart(flashStart) {
    ChangeMem(flashStart, "STARTFLASH = ");
}
exports.ChangeFlashStart = ChangeFlashStart;
function ChangeStackSize(stackSize) {
    ChangeMem(stackSize, "STACKSIZE = ");
}
exports.ChangeStackSize = ChangeStackSize;
function ChangeHeapSize(heapSize) {
    ChangeMem(heapSize, "HEAPSIZE = ");
}
exports.ChangeHeapSize = ChangeHeapSize;
function Get() {
    return new Promise((resolve, reject) => {
        fs.readFile(fullPath, (err, data) => {
            if (data !== undefined) {
                resolve(data.toString());
            }
        });
    });
}
exports.Get = Get;
function Write(jsonData) {
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
    }
    let jsonObject = JSON.stringify(jsonData, null, "\t");
    fs.writeFile(fullPath, jsonObject, () => { });
}
function ChangeMem(newValue, cmprString) {
    Get().then(file => {
        let startIndex = file.indexOf(cmprString) + cmprString.length;
        let lastIndex = file.indexOf(";", startIndex);
        file = file.slice(0, startIndex) + newValue + file.slice(lastIndex);
        fs.writeFile(fullPath, file, () => { });
    });
}
//# sourceMappingURL=Linker.js.map