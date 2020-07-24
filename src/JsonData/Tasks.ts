export interface Data {
  version: string;
  tasks:   Task[];
}

export interface Task {
  label:           string;
  type?:           string;
  command?:        string;
  options?:        Options;
  presentation?:   Presentation;
  group?:          Group;
  problemMatcher?: any[];
  dependsOrder?:   string;
  dependsOn?:      string[];
}

export interface Group {
  kind:      string;
  isDefault: boolean;
}

export interface Options {
  cwd:   string;
  shell: Shell;
}

export interface Shell {
  executable: string;
  args:       string[];
}

export interface Presentation {
  clear: boolean;
}