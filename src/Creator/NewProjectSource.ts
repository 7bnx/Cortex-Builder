import * as fs from 'fs';
import * as path from 'path';

export function New(projectName:string, projectPath: string){
  projectPath = path.join(projectPath, 'user');
  if (!fs.existsSync(projectPath)){ fs.mkdir(projectPath,{recursive:true}, () =>{});}
}