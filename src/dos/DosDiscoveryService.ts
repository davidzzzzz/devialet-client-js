import { Bonjour, Service } from 'bonjour-service'
import debounce from 'debounce';
import { DevialetDeviceRegistry } from './DeviceRegistry';
import { Chunk, Effect, Stream, StreamEmit, Option, Sink, Layer } from 'effect';
import { DevialetDeviceService as DosDeviceService } from './DosDeviceService';
import { DosApiError } from './DosApiError';
import { DeviceGroup } from '../schemas/DeviceGroup';

const devialetDevices: string[] = ['Phantom', 'Arch', 'Dialog'];

/**
 * Service for discovering Devialet devices on the network using Bonjour.
 * 
 * @example
 * // Discover Devialet devices and get their groups
 * const program = Effect.gen(function*() {
 *     const discovery = yield* DosDiscoveryService.create();
 *     const groups = yield* discovery.groups();
 *     console.log(groups);
 * });
 * 
 * // Run the program with the Live layer
 * Effect.runPromise(Effect.provideLayer(program, DosDiscoveryService.Live));
 */
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
                /**
                 * Queries the groups of Devialet devices on the network.
                 * @returns {Effect.Effect<DeviceGroup[], DosApiError, never>} - An effect that represents the command execution
                 */
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