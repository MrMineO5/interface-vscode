import {SourceMarker} from "../sourcemarker";
import {LiveInstrumentEvent, LiveInstrumentEventType} from "./liveInstrumentEvent";
import * as vscode from "vscode";
import BreakpointHit from "../model/breakpointHit";
import * as path from "path";
import LiveBreakpoint from "../model/instruments/liveBreakpoint";
import instrumentListProvider from "../sidebar/instrumentListProvider";

export default class LiveInstrumentManager {
    sourceMarker: SourceMarker

    instruments: LiveBreakpoint[] = [];

    constructor(sourceMarker: SourceMarker) {
        this.sourceMarker = sourceMarker;
    }

    async start() {
        let developer = "system";
        // TODO: this.sourceMarker.config.serviceToken

        this.sourceMarker.eventBusRegisterHandler(`spp.service.live-instrument.subscriber:${developer}`, (err, message) => {
            let body = message.body;
            body.eventType = LiveInstrumentEventType[body.eventType];
            let liveEvent: LiveInstrumentEvent = body;
            this.sourceMarker.log(`Received instrument event. Type: ${LiveInstrumentEventType[liveEvent.eventType]}`);

            switch (liveEvent.eventType) {
                case LiveInstrumentEventType.LOG_HIT:
                    this.handleLogHitEvent(liveEvent);
                    break;
                case LiveInstrumentEventType.BREAKPOINT_HIT:
                    this.handleBreakpointHitEvent(liveEvent);
                    break;
                case LiveInstrumentEventType.BREAKPOINT_ADDED:
                    let liveBreakpoint: LiveBreakpoint = JSON.parse(liveEvent.data);
                    this.handleBreakpointAddedEvent(liveBreakpoint);
                    break;
                case LiveInstrumentEventType.BREAKPOINT_REMOVED:
                    this.handleInstrumentRemovedEvent(liveEvent);
                    break;
                case LiveInstrumentEventType.LOG_ADDED:
                    this.handleLogAddedEvent(liveEvent);
                    break;
                case LiveInstrumentEventType.LOG_REMOVED:
                    this.handleInstrumentRemovedEvent(liveEvent);
                    break;
                default:
                    this.sourceMarker.log(`Un-implemented event type: ${LiveInstrumentEventType[liveEvent.eventType]}`);
            }
        });
    }

    handleLogHitEvent(liveEvent: LiveInstrumentEvent) {
        this.sourceMarker.log(`Log hit event. Data: ${liveEvent.data}`);
    }

    handleBreakpointHitEvent(liveEvent: LiveInstrumentEvent) {
        let hitEvent: BreakpointHit = JSON.parse(liveEvent.data);

        // SidebarHandler.setViewedBreakpointHit(hitEvent);
    }

    handleBreakpointAddedEvent(liveBreakpoint: LiveBreakpoint) {
        this.instruments.push(liveBreakpoint);

        // TODO: Add an event for this?
        instrumentListProvider.refresh();
        this.sourceMarker.liveInstrumentDisplay?.refreshGutterMarks()
    }

    handleLogAddedEvent(liveEvent: LiveInstrumentEvent) {
        this.sourceMarker.log(`Log added event. Data: ${liveEvent.data}`);
    }

    handleInstrumentRemovedEvent(liveEvent: LiveInstrumentEvent) {
        this.sourceMarker.log(`Instrument removed event. Data: ${liveEvent.data}`);
    }
}