import {TextDocument, Uri} from "vscode";
import * as vscode from "vscode";
import * as path from "path";

export function getDocumentPath(fileUri: Uri): string {
    let fileName: string;
    let folder = vscode.workspace.getWorkspaceFolder(fileUri)?.uri;
    if (!folder) {
        // Assume the file is in the root directory
        fileName = path.parse(fileUri.fsPath).name;
    } else {
        fileName = path.relative(folder.fsPath, fileUri.fsPath);
        fileName = fileName.replace(/\\/g, "/");
    }
    return fileName;
}
