import { Interface } from "readline";


export interface JsonVSCWorkspace {
  folders:  Folder[];
}

export interface Folder {
  path: string;
}
