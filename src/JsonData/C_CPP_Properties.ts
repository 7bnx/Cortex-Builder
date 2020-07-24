
export interface Data {
    configurations: Configuration[];
    version:        number;
}

export interface Configuration {
    name:             string;
    compilerPath:     string;
    defines:          string[];
    includePath:      string[];
    cStandard:        string;
    cppStandard:      string;
    intelliSenseMode: string;
}