"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.New = void 0;
const fs = require("fs");
const path = require("path");
function New(projectName, projectPath) {
    projectPath = path.join(projectPath, 'user');
    if (!fs.existsSync(projectPath)) {
        fs.mkdir(projectPath, { recursive: true }, () => { });
    }
}
exports.New = New;
//# sourceMappingURL=NewProjectSource.js.map