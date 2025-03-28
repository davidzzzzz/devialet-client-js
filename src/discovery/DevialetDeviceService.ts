import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import { Effect } from "effect";
import { Queries } from "../dos/Endpoints";
import { DevialetDeviceInformation } from "../schemas/DevialetDeviceInformation";


export class DevialetDeviceService extends Effect.Service<DevialetDeviceService>()(
    'devialet/devices', {
    accessors: true,
    effect: Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;

        const queryDevice = function (hostAddress: string) {
            return Effect.gen(function* ()  {
                const preparedClient = client.pipe(
                    HttpClient.filterStatusOk,
                    HttpClient.mapRequest(HttpClientRequest.prependUrl(hostAddress))
                );
                const response = yield* preparedClient.get(Queries.GENERAL_INFO);
                return yield* HttpClientResponse.schemaBodyJson(DevialetDeviceInformation)(response);
            });
        }
        return { queryDevice };
    }),
    dependencies: [
        FetchHttpClient.layer
    ]
}
) { }