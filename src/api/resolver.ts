import { Bonjour, Service } from 'bonjour-service'
import { Observable, Subject } from 'rxjs';
import { defaultDeviceClient, DevialetDeviceClient } from './devialet_device_client';
import pRetry from 'p-retry';

export type DevialetGroup = {
    readonly hostname: string;
    readonly address: string;
    readonly port: number;
}

export interface DevialetGroupResolver {
    watch(): Observable<DevialetGroup>;
    groups(): Promise<Iterator<DevialetGroup>>;
}

export function defaultResolver(bonjour?: Bonjour | null, deviceClient?: DevialetDeviceClient | null): DevialetGroupResolver {
    return new BonjourResolver(bonjour, deviceClient);
}

class BonjourResolver implements DevialetGroupResolver {
    private bonjour: Bonjour;
    private client: DevialetDeviceClient;
    private watcher: Subject<DevialetGroup>;
    //host to group
    private groupMap: Map<string, DevialetGroup>;

    constructor(bonjour?: Bonjour | null, deviceClient?: DevialetDeviceClient | null) {
        this.bonjour = bonjour != null ? bonjour : new Bonjour();
        this.client = deviceClient != null ? deviceClient : defaultDeviceClient();
        this.groupMap = new Map();
        this.watcher = new Subject();
        const browser = this.bonjour.find(
            {
                type: 'http',
            }
        );
        browser.on('up', async (service: Service) => {
            if (service.port != 80) {
                return;
            }

            // txt records aren't property parsed for reasons?
            const isDevialetDevice = service.host.startsWith('Phantom') || service.host.startsWith('Arch') || service.host.startsWith('Dialog');
            if (!isDevialetDevice) {
                return;
            }
            if (this.groupMap.has(service.host)) {
                return;
            }
            try {
                const deviceInfo = await this.client.deviceInfo(`${service.host}:80`);
                if (deviceInfo.isSystemLeader) {
                    console.log(service);
                    const group: DevialetGroup = {
                        hostname: service.name,
                        address: service.host,
                        port: service.port,
                    };
                    this.groupMap.set(service.host, group);
                    this.watcher.next(group);
                }
            } catch (t) {
                this.watcher.error(t);
            }
        });
        browser.start();
    }

    groups(): Promise<Iterator<DevialetGroup>> {
        const run = async () => {
            if (this.groupMap.size > 0) {
                return this.groupMap.values();
            }
            throw Error("no results");
        };

        return pRetry(run, {
            retries: 5,
            minTimeout: 100,
            maxTimeout: 1000 * 10
        });
    }

    watch(): Observable<DevialetGroup> {
        return this.watcher.asObservable();
    }
}