import * as vscode from "vscode";
import {getSourceMarker} from "../extension";
import * as path from "path";

export default async function addBreakpointCommand() {
    console.log("addBreakpointCommand");

    let sourceMarker = getSourceMarker();
    if (!sourceMarker) {
        vscode.window.showErrorMessage("Currently Source++ can only be used in a workspace.");
        return;
    }

    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("No active editor.");
        return;
    }

    let fileName: string;
    let fileUri = editor.document.uri; // TODO: Relative path
    let folder = vscode.workspace.getWorkspaceFolder(fileUri)?.uri;
    if (!folder) {
        // Assume the file is in the root directory
        fileName = path.parse(fileUri.fsPath).name;
    } else {
        fileName = path.relative(folder.fsPath, fileUri.fsPath);
        fileName = fileName.replace(/\\/g, "/");
    }

    let line = editor.selection.active.line;

    let input = vscode.window.createInputBox();
    input.title = `Add Breakpoint [${fileUri}:${line}]`;
    input.totalSteps = 2;
    input.prompt = "Breakpoint Condition (optional)";
    input.step = 1;
    await new Promise<void>(resolve => {
        input.onDidAccept(resolve);
        input.show();
    });
    let condition = input.value;

    input.value = "1";
    input.prompt = "Hit Limit";
    input.step = 2;
    await new Promise<void>(resolve => {
        input.onDidAccept(() => {
            let value = parseInt(input.value);
            if (isNaN(value) || value < 1) {
                vscode.window.showErrorMessage("Hit Limit must be a positive integer");
                return;
            }
            resolve();
        });
        input.show();
    });
    let hitLimit = parseInt(input.value);
    input.dispose();

    let result = await sourceMarker.addLiveBreakpoint({
        "source": fileName,
        "line": line
    }, condition, hitLimit);

    console.log(result);
}

