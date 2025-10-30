import ivm from 'isolated-vm';


export class PluginHost {
private isolate: ivm.Isolate;

constructor() {
// Create an isolate with a strict memory limit.
this.isolate = new ivm.Isolate({ memoryLimit: 128 });
}

async execute(code: string): Promise<unknown> {
const context = await this.isolate.createContext();
const jail = context.global;

// Prevent access to the global context.
await jail.set('global', jail.derefInto());

// TODO: Implement permission checks based on the manifest.
// For now, all access is denied by default.

const script = await this.isolate.compileScript(code);
const result = await script.run(context, { timeout: 1000 });

context.release();
return result;
}
}
