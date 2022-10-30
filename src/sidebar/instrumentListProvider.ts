import {Event, EventEmitter, ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState} from "vscode";
import LiveBreakpoint from "../model/instruments/liveBreakpoint";
import {getSourceMarker} from "../extension";

type LiveInstrumentTreeItem = string | LiveBreakpoint;

class InstrumentListProvider implements TreeDataProvider<LiveInstrumentTreeItem> {
    private _onDidChangeTreeData: EventEmitter<LiveInstrumentTreeItem | undefined> = new EventEmitter<LiveInstrumentTreeItem | undefined>();

    readonly onDidChangeTreeData: Event<LiveInstrumentTreeItem | undefined> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getChildren(element?: LiveInstrumentTreeItem): ProviderResult<LiveInstrumentTreeItem[]> {
        if (!element) {
            // Get all files with live instruments
            let files = getSourceMarker()?.liveInstrumentManager?.instruments
                .map(instrument => instrument.location.source);
            console.log(files);
            return [...new Set(files)];
        }
        if (typeof element === "string") {
            // Get all live instruments in this file
            return getSourceMarker()?.liveInstrumentManager?.instruments
                .filter(instrument => instrument.location.source === element);
        }
        return [];
    }

    getTreeItem(element: LiveInstrumentTreeItem): TreeItem | Thenable<TreeItem> {
        if (typeof element === "string") {
            return {
                label: element as string,
                collapsibleState: TreeItemCollapsibleState.Collapsed
            };
        }

        let breakpoint = element as LiveBreakpoint;
        return {
            label: `Line ${breakpoint.location.line + 1}: Breakpoint`,
            command: {
                title: "View Breakpoint",
                command: "sourceplusplus.viewBreakpoint", // TODO: Go to line when this is clicked?
                arguments: [breakpoint]
            }
        };
    }
}

const instrumentListProvider = new InstrumentListProvider();
export default instrumentListProvider;
