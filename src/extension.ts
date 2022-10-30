// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {Uri} from 'vscode';
import {SourceMarker} from "./sourcemarker";
import addBreakpointCommand from "./commands/addBreakpointCommand";
import LiveBreakpoint from "./model/instruments/liveBreakpoint";
import instrumentListProvider from "./sidebar/instrumentListProvider";

const workspaces = new Map<Uri, SourceMarker>();

export function getSourceMarker(): SourceMarker | undefined {
    let workspaceUri = vscode.workspace.workspaceFile;
    if (!workspaceUri)
        return undefined;

    let sourceMarker = workspaces.get(workspaceUri);
    if (!sourceMarker) {
        sourceMarker = new SourceMarker();
        workspaces.set(workspaceUri, sourceMarker);
    }
    return sourceMarker;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    vscode.workspace.onDidChangeConfiguration((e) => {
        if (!e.affectsConfiguration("sourceplusplus"))
            return;

        getSourceMarker()?.init(vscode.workspace.getConfiguration("sourceplusplus"));
    });

    getSourceMarker()?.init(vscode.workspace.getConfiguration("sourceplusplus"));

    const testCommandId = "sourceplusplus.statusClick";
    let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, -Infinity);
    statusBarItem.command = testCommandId;
    statusBarItem.text = "S++";
    statusBarItem.tooltip = "Click to disable Source++";
    statusBarItem.show();

    vscode.commands.registerCommand(testCommandId, () => {
        let inputBox = vscode.window.createInputBox();
        inputBox.prompt = "test";
        inputBox.show();

        console.log("Status bar pressed!");
    });

    vscode.window.registerTreeDataProvider('instrument-list', instrumentListProvider);

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "sourceplusplus" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('sourceplusplus.addBreakpoint', addBreakpointCommand);

    let viewBreakpointDisposable = vscode.commands.registerCommand('sourceplusplus.viewBreakpoint', (breakpoint: LiveBreakpoint) => {
        if (breakpoint.view) {
            // If the breakpoint has a view, open it
            breakpoint.view.reveal(vscode.ViewColumn.Beside);
            return;
        }

        breakpoint.view = vscode.window.createWebviewPanel("breakpoint", "Source++ Breakpoint " + breakpoint.id, vscode.ViewColumn.Beside, {
            enableScripts: true,
        });
        breakpoint.view.onDidDispose(() => {
            breakpoint.view = undefined;
        });

        breakpoint.view.webview.html = `<!DOCTYPE html>
                                <html lang="en">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <title>Document</title>
                                </head>
                                <body>
                                    <h1>Breakpoint ${breakpoint.id}</h1>
                                    <h3>Location: ${breakpoint.location.source}:${breakpoint.location.line + 1}</h3>
                                    <table>
                                        <tr><td>test</td></tr>
                                        <tr><td>test</td></tr>
                                    </table>
                                </body>
                                </html>`;
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
