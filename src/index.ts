import { DevialetDiscovery } from "./compat/async/DevialetDiscovery";

const discovery = new DevialetDiscovery();
discovery.getDevices().then(d => console.log(d));