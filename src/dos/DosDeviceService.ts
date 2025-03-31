import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import { Effect, Layer } from "effect";
import { Queries } from "./Endpoints";
import { DeviceInformation, DeviceInformationSchema } from "../schemas/DeviceInformation";
import { DosApiError } from "./DosApiError";


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
        return { queryDevice };
    }),
    dependencies: [
        FetchHttpClient.layer
    ]
}
) { 
    static Live = Layer.provide(DevialetDeviceService.Default, FetchHttpClient.layer);
}