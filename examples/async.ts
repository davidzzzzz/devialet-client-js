import { DevialetAsync } from '../src/compat/async/DevialetAsync';

const discovery = new DevialetAsync.DevialetDiscovery();
discovery.getDevices().then(d => {
    console.log(d);
    const dos = new DevialetAsync.DevialetDos(d[0].leader);
    dos.getCurrentState().then(n => console.log(n));
});
