import { Bonjour, Service } from 'bonjour-service'
import pRetry from 'p-retry';
import { DevialetGroup, DeviceInformation } from '../models/device_information';
import axios from 'axios';
import { Queries } from './endpoints';
import debounce from 'debounce';
import { DevialetDeviceRegistry } from './registry';

const devialetDevices: string[] = ['Phantom', 'Arch', 'Dialog'];

export class DevialetmDNSResolver {
    private bonjour: Bonjour;
    private ready: boolean = false;
    private registry: DevialetDeviceRegistry;

    constructor(bonjour?: Bonjour | null) {
        this.bonjour = bonjour != null ? bonjour : new Bonjour();
        this.registry = new DevialetDeviceRegistry();
        const browser = this.bonjour.find({ type: 'http' });
        const scanCompleteGuard = debounce(() => this.ready = true, 500);
        browser.on('up', async (service: Service) => {
            scanCompleteGuard();
            this.handleService(service);
        });
        browser.on('txt-update', async (service: Service) => this.handleService(service));
        browser.on('down', service =>  this.registry.unregisterDevice(f => f.hostname === service.name));
        browser.start();
    }

    private async handleService(service: Service) {
        if (service.port != 80) {
            return;
        }

        // txt records aren't property parsed for reasons?
        if (!devialetDevices.find(f => service.host.startsWith(f))) {
            return;
        }
        try {
            const deviceInfo = await this.deviceInfo(`${service.host}:80`);
            this.registry.registerDevice({
                id: deviceInfo.deviceId,
                hostname: service.name,
                address: service.host,
                port: service.port,
                information: deviceInfo
            });
        } catch (t) {
            // how to handle this?
            console.log(t);
        }
    }

    groups(): Promise<DevialetGroup[]> {
        const run = async () => {
            if (!this.ready) {
                throw Error("No Devialet Groups could be found on the given network");
            }
            return this.registry.groups();
        };

        return pRetry(run, {
            retries: 5,
            minTimeout: 500,
            maxTimeout: 1000 * 30
        });
    }

    private async deviceInfo(ipAddress: string): Promise<DeviceInformation> {
        const response = await axios.get<DeviceInformation>(`http://${ipAddress}${Queries.GENERAL_INFO}`);
        return response.data;
    }
}