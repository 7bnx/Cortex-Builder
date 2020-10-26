# Change Log

## Release Notes

### 1.0.3

##### Improvements

 - openeOCD
     - Remove 'reset' of target after erase
     - Add echo 'Done'

##### Fixes 

 - Jlink:
     - Fixed issue of jlink with openOCD (Flash, Erase, Reset)

### 1.0.2

##### Fixes 

 - Makefile:
     - Change 'clean' target to be compatible with [Windows Build Tools](https://github.com/xpack-dev-tools/windows-build-tools-xpack/releases)


### 1.0.1

##### Improvements 

 - Makefile:
     - Add *echo* to print current compiling file ( *c*, *c++*, *s*)
     - Reduce output *asm* by adding *--start-address*
     - Visualize jumps by drawing ASCII art lines

##### Fixes 

 - Makefile:
     - ASM, C, CPP Compile flags did not change via settings

### 1.0.0

Initial release

