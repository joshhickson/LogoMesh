// A simple, in-memory event emitter for decoupling the orchestrator.
import { EventEmitter } from 'events';
export const evaluationEvents = new EventEmitter();
