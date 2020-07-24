export interface Data {
  version:        string;
  configurations: Configuration[];
}

export interface Configuration {
  name:         string;
  cwd:          string;
  executable:   string;
  svdFile:      string;
  request:      string;
  type:         string;
  servertype:   string;
  device:       string;
  interface:    string;
  runToMain:    boolean;
  configFiles:  string[];
}