import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import { Effect, Layer } from "effect";
import { Queries } from "./Endpoints";
import { DeviceInformation, DeviceInformationSchema } from "../schemas/DeviceInformation";
import { DosApiError } from "./DosApiError";

/**
 * Service for interacting with Devialet devices over HTTP using the Device Operating System (DOS) API.
 * 
 * 
 * @example
 * // Query a device at a specific IP address
 * const program = DevialetDeviceService.queryDevice("http://192.168.1.10").pipe(
 *   Effect.map(deviceInfo => console.log(deviceInfo))
 * );
 * 
 * // Run the program with the Live layer
 * Effect.runPromise(Effect.provideLayer(program, DevialetDeviceService.Live));
 */
export class DevialetDeviceService extends Effect.Service<DevialetDeviceService>()(
    'devialet/devices', {
    accessors: true,
    effect: Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;

        const queryDevice = function (hostAddress: string): Effect.Effect<DeviceInformation, DosApiError, never> {
            return Effect.gen(function* ()  {
                const preparedClient = client.pipe(
                    HttpClient.filterStatusOk,
                    HttpClient.mapRequest(HttpClientRequest.prependUrl(hostAddress))
                );
                const response = yield* preparedClient.get(Queries.GENERAL_INFO);
                return yield* HttpClientResponse.schemaBodyJson(DeviceInformationSchema)(response);
            }).pipe(
                Effect.mapError((e) => new DosApiError(e.message, e))
            );
        }
        return { 
            /**
             * Queries the device information from a Devialet device at the specified host address.
             * @returns {Effect.Effect<DeviceInformation, DosApiError, never>} - An effect that represents the command execution
             */
            queryDevice 
        };
    }),
    dependencies: [
        FetchHttpClient.layer
    ]
}
) { 
    static Live = Layer.provide(DevialetDeviceService.Default, FetchHttpClient.layer);
}