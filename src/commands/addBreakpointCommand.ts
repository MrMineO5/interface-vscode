import * as vscode from "vscode";
import {getSourceMarker} from "../extension";
import * as path from "path";
import {getDocumentPath} from "../util/artifactNamingUtil";

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

    let fileName = getDocumentPath(editor.document.uri);

    let line = editor.selection.active.line;

    let input = vscode.window.createInputBox();
    input.title = `Add Breakpoint [${fileName}:${line}]`;
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

    if (result.status != 200) {
        vscode.window.showErrorMessage("Failed to add breakpoint.");
    }
}

