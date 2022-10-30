import * as vscode from "vscode";
import {
    CancellationToken,
    CodeLens,
    CodeLensProvider,
    ProviderResult,
    TextDocument, TextEditor,
    TextEditorDecorationType
} from "vscode";
import {SourceMarker} from "../sourcemarker";
import {getDocumentPath} from "../util/artifactNamingUtil";
import * as path from "path";

export default class LiveInstrumentDisplay {
    sourceMarker: SourceMarker

    private textDecoration: TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        gutterIconPath: path.join(__dirname, "..", "..", "icons", "live-breakpoint-active.svg"),
        gutterIconSize: "80% contain"
    });

    constructor(sourceMarker: SourceMarker) {
        this.sourceMarker = sourceMarker;
    }

    start() {
        let provider: CodeLensProvider<CodeLens> = {
            provideCodeLenses: (document: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> => {
                let fileName = getDocumentPath(document.uri);
                let breakpoints = this.sourceMarker.liveInstrumentManager?.instruments
                    .filter(b => b.location.source === fileName);

                if (!breakpoints)
                    return [];

                return breakpoints.map(b => {
                    let range = new vscode.Range(b.location.line, 0, b.location.line, 10);
                    let command = {
                        title: "Source++ Breakpoint",
                        command: "sourceplusplus.viewBreakpoint",
                        tooltip: "View Breakpoint",
                        arguments: [b]
                    };
                    return new vscode.CodeLens(range, command);
                });
            }
        };
        vscode.languages.registerCodeLensProvider({scheme: "file"}, provider);

        vscode.window.onDidChangeVisibleTextEditors(this.refreshGutterMarks);
    }

    refreshGutterMarks() {
        vscode.window.visibleTextEditors.forEach(editor => {
            let breakpoints = this.sourceMarker.liveInstrumentManager?.instruments
                .filter(b => b.location.source === getDocumentPath(editor.document.uri))
                .map(b => new vscode.Range(b.location.line, 0, b.location.line, 10));
            editor.setDecorations(this.textDecoration, breakpoints || []);
        });
    }
}