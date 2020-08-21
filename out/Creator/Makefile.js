"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateIncludeDir = exports.UpdateSource = exports.ChangeOptimization = exports.ChangeCPPStandard = exports.ChangeCStandard = exports.ChangeCPPFlags = exports.ChangeCFlags = exports.ChangeAsmFlags = exports.New = exports.Replace = void 0;
const fs = require("fs");
const vscode = require("vscode");
const path = require("path");
const startup_1 = require("../startup");
const fileName = "Makefile";
const filePath = path.join((vscode.workspace.rootPath === undefined) ? "" : vscode.workspace.rootPath);
const fullPath = path.join(filePath, fileName);
function Replace(projectType, core, flashStart, makefileFPU, makefileFLOATABI, cStandard, cppStandard, optimization, defines, includesDir, sources, flagsASM, flagsC, flagsCPP, projectPath = filePath) {
    let projectName = (projectPath.split(path.sep))[projectPath.split(path.sep).length - 1];
    projectPath = projectPath.replace(/\\/g, "/");
    let include = "";
    let cSource = "";
    let cppSource = "";
    let asmSource = "Startup.s";
    includesDir.forEach(path => {
        path = path.replace(/\\/g, "/");
        include += "\\\n-I" + path;
    });
    sources.forEach(path => {
        path = path.replace(/\\/g, "/");
        if (path.charAt(path.length - 1) === 'c') {
            cSource += "\\\n" + path;
        }
        else if (path.charAt(path.length - 2) === 'p') {
            cppSource += "\\\n" + path;
        }
        else if (path.charAt(path.length - 1) === 's') {
            asmSource += "\\\n" + path;
        }
    });
    let _flagsASM = "";
    let _flagsC = "";
    let _flagsCPP = "";
    if (flagsASM === undefined) {
        _flagsASM = flagsDefaultASM;
    }
    else {
        flagsASM.forEach(flag => { _flagsASM += "\\\n" + flag; });
    }
    if (flagsC === undefined) {
        _flagsC = flagsDefaultC;
    }
    else {
        flagsC.forEach(flag => { _flagsC += "\\\n" + flag; });
    }
    if (flagsCPP === undefined) {
        _flagsCPP = flagsDefaultCPP;
    }
    else {
        flagsCPP.forEach(flag => { _flagsCPP += "\\\n" + flag; });
    }
    let _defines = "";
    defines.forEach(define => {
        _defines += "\\\n-D" + define;
    });
    if (projectType === 'C') {
        projectType = 'CC';
    }
    else {
        projectType = 'CXX';
    }
    if (cppStandard === 'c++20') {
        cppStandard = 'c++2a';
    }
    if (cppStandard === 'gnu++20') {
        cppStandard = 'gnu++2a';
    }
    const data = `
#-----------------------------------------------------------------------------------------
#	  Generated by Cortex-Builder extension for Visual Studio code
#	  Author: Semyon Ivanov
#	  e-mail: agreement90@mail.ru
#	  repo: https://github.com/7bnx/Cortex-Builder
#-----------------------------------------------------------------------------------------


#-----------------------------------------------------------------------------------------
#	Defines
#-----------------------------------------------------------------------------------------
TARGET = ${projectName}
CORE = ${core}
FLASHSTART = ${flashStart}
INCLUDEDEFINE = ${_defines}
#-----------------------------------------------------------------------------------------
#	End of Defines
#-----------------------------------------------------------------------------------------


#-----------------------------------------------------------------------------------------
#	Output folders
#-----------------------------------------------------------------------------------------
BUILD_PATH = build
OUTPUT_PATH = output
#-----------------------------------------------------------------------------------------
#	End of Output folders
#-----------------------------------------------------------------------------------------


#-----------------------------------------------------------------------------------------
#	Settings
#-----------------------------------------------------------------------------------------
CPPSTANDARD = ${cppStandard}
CSTANDARD = ${cStandard}
OPTIMIZATION = ${optimization}
DEBUG = 
#-----------------------------------------------------------------------------------------
#	End of Settings
#-----------------------------------------------------------------------------------------


#-----------------------------------------------------------------------------------------
#	Binaries
#-----------------------------------------------------------------------------------------
PREFIX = arm-none-eabi-
CC = $(PREFIX)gcc
CXX = $(PREFIX)g++
AS = $(PREFIX)gcc -x assembler-with-cpp
CP = $(PREFIX)objcopy
SZ = $(PREFIX)size
OBJDUMP = $(PREFIX)objdump
HEX = $(CP) -O ihex
BIN = $(CP) -O binary -S
#-----------------------------------------------------------------------------------------
#	End of Binaries
#-----------------------------------------------------------------------------------------

 
#-----------------------------------------------------------------------------------------
#	MCU Flags
#-----------------------------------------------------------------------------------------
CPU = -mcpu=$(CORE)
FPU = ${makefileFPU}
FLOATABI = ${makefileFLOATABI}
MCU = $(CPU) -mthumb $(FPU) $(FLOATABI)
#-----------------------------------------------------------------------------------------
#	End of MCU Flags
#-----------------------------------------------------------------------------------------

#-----------------------------------------------------------------------------------------
#	Defines
#-----------------------------------------------------------------------------------------
ASM_DEFINES = 
CANDCPP_DEFINES = $(INCLUDEDEFINE)
#-----------------------------------------------------------------------------------------
#	End of Defines
#-----------------------------------------------------------------------------------------

#-----------------------------------------------------------------------------------------
#	Includes
#-----------------------------------------------------------------------------------------
ASM_INCLUDES = 
CANDCPP_INCLUDES = ${include}
#-----------------------------------------------------------------------------------------
#	End of Includes
#-----------------------------------------------------------------------------------------

#-----------------------------------------------------------------------------------------
#	Sources
#-----------------------------------------------------------------------------------------
ASM_SOURCE = ${asmSource}
C_SOURCE = ${cSource}
CPP_SOURCE = ${cppSource}
#-----------------------------------------------------------------------------------------
#	End of Sources
#-----------------------------------------------------------------------------------------

#-----------------------------------------------------------------------------------------
#	Linker
#-----------------------------------------------------------------------------------------
LDSCRIPT = Linker.ld
LIBS = -lc -lm -lnosys
LIBDIR = 
LDFLAGS = $(MCU) -specs=nano.specs -specs=nosys.specs -T$(LDSCRIPT) $(LIBDIR) $(LIBS)\\
-Wl,-Map=$(BUILD_PATH)/$(TARGET).map,--cref -Wl,--gc-sections,--print-memory-usage
#-----------------------------------------------------------------------------------------
#	End of Linker
#-----------------------------------------------------------------------------------------

 
#-----------------------------------------------------------------------------------------
#	Source Flags
#-----------------------------------------------------------------------------------------
ASMFLAGS = $(MCU) $(ASM_DEFINES) $(ASM_INCLUDES) $(OPTIMIZATION)${_flagsASM}
CFLAGS = $(MCU) $(CANDCPP_DEFINES) $(CANDCPP_INCLUDES) $(OPTIMIZATION) -std=$(CSTANDARD)${_flagsC}
CPPFLAGS = $(MCU) $(CANDCPP_DEFINES) $(CANDCPP_INCLUDES) $(OPTIMIZATION) -std=$(CPPSTANDARD)${_flagsCPP}
#	 Create dependencies info
CFLAGS += -MMD -MP -MF$(@:%.o=%.d)
CPPFLAGS += -MMD -MP -MF$(@:%.o=%.d)
#-----------------------------------------------------------------------------------------
#	End of Source Flags
#-----------------------------------------------------------------------------------------


#-----------------------------------------------------------------------------------------
#	Objects list
#-----------------------------------------------------------------------------------------
OBJECTS = $(addprefix $(BUILD_PATH)/,$(notdir $(C_SOURCE:.c=.o)))
vpath %.c $(sort $(dir $(C_SOURCE))) 
OBJECTS += $(addprefix $(BUILD_PATH)/,$(notdir $(CPP_SOURCE:.cpp=.o)))
vpath %.cpp $(sort $(dir $(CPP_SOURCE))) 
OBJECTS += $(addprefix $(BUILD_PATH)/,$(notdir $(ASM_SOURCE:.s=.o)))
vpath %.s $(sort $(dir $(ASM_SOURCE)))
DEPS := $(OBJECTS:.o=.d)
-include $(DEPS)
ASMOUTPUTFILE = $(OBJDUMP) -DSG -t -marm -w --start-address=$(FLASHSTART) --show-raw-insn \\
--visualize-jumps --inlines $(OUTPUT_PATH)/$(TARGET).elf \\
-Mforce-thumb -Mreg-names-std > $(OUTPUT_PATH)/$(TARGET).s
#-----------------------------------------------------------------------------------------
#	End of Objects list
#-----------------------------------------------------------------------------------------


#-----------------------------------------------------------------------------------------
#	Output build
#-----------------------------------------------------------------------------------------
$(BUILD_PATH)/%.o: %.c Makefile | $(BUILD_PATH)
\t@echo $<
\t$(CC) $(CFLAGS) -Wa,-a,-ad,-alms=$(BUILD_PATH)/$(notdir $(<:.c=.lst)) -c $< -o $@

$(BUILD_PATH)/%.o: %.cpp Makefile | $(BUILD_PATH)
\t@echo $<
\t$(CXX) $(CPPFLAGS) -Wa,-a,-ad,-alms=$(BUILD_PATH)/$(notdir $(<:.cpp=.lst)) -c $< -o $@

$(BUILD_PATH)/%.o: %.s Makefile | $(BUILD_PATH)
\t@echo $<
\t$(AS) -c $(ASMFLAGS) $< -o $@

$(OUTPUT_PATH)/$(TARGET).elf: $(OBJECTS) Makefile
\t$(${projectType}) $(OBJECTS) $(LDFLAGS) -o $@

$(OUTPUT_PATH)/%.hex: $(OUTPUT_PATH)/%.elf | $(OUTPUT_PATH)
\t$(HEX) $< $@
\t$(SZ) $< $@

$(OUTPUT_PATH)/%.bin: $(OUTPUT_PATH)/%.elf | $(OUTPUT_PATH)
\t$(BIN) $< $@
\t$(ASMOUTPUTFILE)

$(BUILD_PATH): 
\tmkdir $@

$(OUTPUT_PATH): 
\tmkdir $@
#-----------------------------------------------------------------------------------------
#	End of Output build
#-----------------------------------------------------------------------------------------


#-----------------------------------------------------------------------------------------
#	Actions
#-----------------------------------------------------------------------------------------
all: $(OUTPUT_PATH)/$(TARGET).elf $(OUTPUT_PATH)/$(TARGET).hex $(OUTPUT_PATH)/$(TARGET).bin
\t@echo "Build Completed."

clean:
\tif exist $(OUTPUT_PATH)\ rd /q /s $(OUTPUT_PATH)
\tif exist $(BUILD_PATH)\ rd /q /s $(BUILD_PATH)
\t@echo "Clean Completed." 
#-----------------------------------------------------------------------------------------
#	End of Actions
#-----------------------------------------------------------------------------------------`;
    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
    }
    fs.writeFile(path.join(projectPath, fileName), data, () => { });
}
exports.Replace = Replace;
function New(projectPath, controller, flags) {
    let includesDir = [path.join(startup_1.context.globalStoragePath, 'Core'),
        path.join(startup_1.context.globalStoragePath, 'Include', controller.include),
        path.join(projectPath, 'user')];
    let projectType = startup_1.context.globalState.get('projectType', 'C');
    let cStandard = startup_1.context.globalState.get('cStandard', 'c11');
    let cppStandard = startup_1.context.globalState.get('cppStandard', 'c++17');
    let optimization = startup_1.context.globalState.get('optimization', '-O1');
    Replace(projectType, controller.core, controller.flashStart, controller.makefileFPU, controller.makefileFLOATABI, cStandard, cppStandard, optimization, [controller.define], includesDir, [], [flagsDefaultASM], [flagsDefaultC], [flagsDefaultCPP], projectPath);
}
exports.New = New;
function ChangeAsmFlags(asmFlags) {
    Change(asmFlags, "ASMFLAGS = ", "CFLAGS", "$(MCU) $(ASM_DEFINES) $(ASM_INCLUDES) $(OPTIMIZATION)");
}
exports.ChangeAsmFlags = ChangeAsmFlags;
function ChangeCFlags(cFlags) {
    Change(cFlags, "CFLAGS = ", "CPPFLAGS", "$(MCU) $(CANDCPP_DEFINES) $(CANDCPP_INCLUDES) $(OPTIMIZATION) -std=$(CSTANDARD)");
}
exports.ChangeCFlags = ChangeCFlags;
function ChangeCPPFlags(cppFlags) {
    Change(cppFlags, "CPPFLAGS = ", "#	 Create dependencies info", "$(MCU) $(CANDCPP_DEFINES) $(CANDCPP_INCLUDES) $(OPTIMIZATION) -std=$(CPPSTANDARD)");
}
exports.ChangeCPPFlags = ChangeCPPFlags;
function ChangeCStandard(cStandard) {
    Change([cStandard], "CSTANDARD = ", "OPTIMIZATION");
}
exports.ChangeCStandard = ChangeCStandard;
function ChangeCPPStandard(cppStandard) {
    Change([cppStandard], "CPPSTANDARD = ", "CSTANDARD");
}
exports.ChangeCPPStandard = ChangeCPPStandard;
function ChangeOptimization(optimization) {
    Change([optimization], "OPTIMIZATION = ", "DEBUG");
}
exports.ChangeOptimization = ChangeOptimization;
function UpdateSource(sources) {
    Get().then(file => {
        let cSource = "C_SOURCE = ";
        let cppSource = "CPP_SOURCE = ";
        let asmSource = "";
        sources.forEach(src => {
            src = src.replace(/\\/g, "/");
            if (src.charAt(src.length - 1) === 'c') {
                cSource += "\\\n" + src;
            }
            else if (src.charAt(src.length - 1) === 'p') {
                cppSource += "\\\n" + src;
            }
            else {
                asmSource += "\\\n" + src;
            }
        });
        Change([asmSource + "\n" + cSource + "\n" + cppSource], "ASM_SOURCE = Startup.s", "#-----------");
    });
}
exports.UpdateSource = UpdateSource;
function UpdateIncludeDir(includes) {
    Get().then(file => {
        let includesStr = "";
        includes.forEach(item => {
            item = item.replace(/\\/g, "/");
            includesStr += "\\\n-I" + item;
        });
        Change([includesStr], "CANDCPP_INCLUDES = ", "#----------------------------");
    });
}
exports.UpdateIncludeDir = UpdateIncludeDir;
function Change(newParams, cmprStrStart, cmprStrEnd, startStr = "") {
    Get().then(file => {
        let startIndex = file.indexOf(cmprStrStart) + cmprStrStart.length;
        let lastIndex = file.indexOf(cmprStrEnd, startIndex - 1);
        let newParamsStr = startStr;
        if (newParams.length > 1) {
            newParams.forEach(flag => { newParamsStr += "\\\n" + flag; });
        }
        else {
            newParamsStr += newParams[0];
        }
        file = file.slice(0, startIndex) + newParamsStr + "\n" + file.slice(lastIndex);
        fs.writeFile(fullPath, file, () => { });
    });
}
function Get() {
    return new Promise((resolve, reject) => {
        fs.readFile(fullPath, (err, data) => {
            if (data !== undefined) {
                resolve(data.toString());
            }
        });
    });
}
const flagsDefaultASM = "\\\n-Wall -fdata-sections -ffunction-sections";
const flagsDefaultC = "\\\n-Wall -fdata-sections -ffunction-sections -ggdb";
const flagsDefaultCPP = "\\\n-Wall -fdata-sections -ffunction-sections -fno-exceptions -ggdb";
/*EOF*/ 
//# sourceMappingURL=Makefile.js.map