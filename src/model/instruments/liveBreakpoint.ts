import LiveLocation from "../liveLocation";
import {WebviewPanel} from "vscode";

export default interface LiveBreakpoint {
    id: string
    location: LiveLocation

    view?: WebviewPanel
}