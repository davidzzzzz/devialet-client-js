import { Bonjour, Service } from 'bonjour-service'
import debounce from 'debounce';
import { DevialetDeviceRegistry } from './DeviceRegistry';
import { Chunk, Effect, Stream, StreamEmit, Option, Sink, Layer } from 'effect';
import { DevialetDeviceService as DosDeviceService } from './DosDeviceService';
import { DosApiError } from './DosApiError';
import { DeviceGroup } from '../schemas/DeviceGroup';

const devialetDevices: string[] = ['Phantom', 'Arch', 'Dialog'];

export class DosDiscoveryService extends Effect.Service<DosDiscoveryService>()("devialet/discovery",
    {
        accessors: true,
        effect: Effect.gen(function*() {
            const bonjour = new Bonjour();
            const registry = new DevialetDeviceRegistry();
            const browser = bonjour.find({ type: 'http' });
            const stream = Stream.async(
                (emit: StreamEmit.Emit<never, never, Service, void>) => {
                    const scanCompleteGuard = debounce(() => emit(
                        Effect.fail(Option.none())
                    ), 500);
                    browser.on('up', (service: Service) => {
                        scanCompleteGuard();
                        emit(Effect.succeed(Chunk.of(service)));
                    });
                    browser.start();
                }
            );
            const deviceService = yield * DosDeviceService;
            const deviceStream = stream.pipe(
                Stream.filter((s) => s.port == 80),
                Stream.filter((s) => devialetDevices.findIndex((f) => s.host.startsWith(f)) != -1),
                Stream.flatMap((s) => Effect.gen(function* () {
                    const deviceInfo = yield* deviceService.queryDevice(`http://${s.host}:80`);
                    return {
                        id: deviceInfo.deviceId,
                        hostname: s.name,
                        address: s.host,
                        port: s.port,
                        information: deviceInfo
                    };
                })),
            );
            const groups = () : Effect.Effect<DeviceGroup[], DosApiError, never> => Effect.gen(function*() {
                const devices = yield* Stream.run(deviceStream, Sink.collectAll());
                devices.pipe(
                    Chunk.forEach((d) => registry.registerDevice(d))
                );
                return registry.groups();
            });
            return {
                groups
            };
        }),
        dependencies: [
            DosDeviceService.Live
        ]
    }
) {
    static Live = Layer.provide(DosDiscoveryService.Default, DosDeviceService.Live);

    static create(): Effect.Effect<DosDiscoveryService, never, never> {
        return Effect.gen(function* () {
            return yield* DosDiscoveryService;
        }).pipe(
            Effect.provide(DosDiscoveryService.Live)
        );
 }
}

// export class foo {
//     private bonjour: Bonjour;
//     private ready: boolean = false;
//     private registry: DevialetDeviceRegistry;

//     constructor(bonjour?: Bonjour | null) {
//         this.bonjour = bonjour != null ? bonjour : new Bonjour();
//         this.registry = new DevialetDeviceRegistry();
//         const browser = this.bonjour.find({ type: 'http' });
//         const scanCompleteGuard = debounce(() => this.ready = true, 500);
//         browser.on('up', async (service: Service) => {
//             scanCompleteGuard();
//             this.handleService(service);
//         });
//         browser.on('txt-update', async (service: Service) => this.handleService(service));
//         browser.on('down', service => this.registry.unregisterDevice(f => f.hostname === service.name));
//         browser.start();
//     }

//     private async handleService(service: Service) {
//         if (service.port != 80) {
//             return;
//         }

//         // txt records aren't property parsed for reasons?
//         if (!devialetDevices.find(f => service.host.startsWith(f))) {
//             return;
//         }
//         try {
//             const deviceInfo = await this.deviceInfo(`${service.host}:80`);
//             this.registry.registerDevice({
//                 id: deviceInfo.deviceId,
//                 hostname: service.name,
//                 address: service.host,
//                 port: service.port,
//                 information: deviceInfo
//             });
//         } catch (t) {
//             // how to handle this?
//             console.log(t);
//         }
//     }

//     groups(): Promise<DevialetGroup[]> {
//         const run = async () => {
//             if (!this.ready) {
//                 throw Error("No Devialet Groups could be found on the given network");
//             }
//             return this.registry.groups();
//         };

//         return pRetry(run, {
//             retries: 5,
//             minTimeout: 500,
//             maxTimeout: 1000 * 30
//         });
//     }

//     private async deviceInfo(ipAddress: string): Promise<DeviceInformation> {
//         const response = await axios.get<DeviceInformation>(`http://${ipAddress}${Queries.GENERAL_INFO}`);
//         return response.data;
//     }
// }