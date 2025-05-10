import { DevialetAsync } from '../src/compat/async/DevialetAsync';

const discovery = DevialetAsync.createDiscoveryClient();
discovery.getDevices().then(d => {
    console.log(d);
    const dos = DevialetAsync.createDosClient(d[0].leader);
    dos.getCurrentState().then(n => console.log(n));
});
