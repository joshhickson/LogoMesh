import * as ivm from 'isolated-vm';

async function verifyIvm() {
  try {
    console.log('Attempting to verify isolated-vm...');
    const isolate = new ivm.Isolate({ memoryLimit: 8 });
    const context = await isolate.createContext();
    const jail = context.global;
    await jail.set('log', function (...args: any[]) {
      console.log(...args);
    });

    const code = `log('Hello from isolate')`;
    const script = await isolate.compileScript(code);
    await script.run(context, { timeout: 1000 });
    console.log('isolated-vm verification successful.');
  } catch (error) {
    console.error('isolated-vm verification failed:', error);
    process.exit(1);
  }
}

verifyIvm();
