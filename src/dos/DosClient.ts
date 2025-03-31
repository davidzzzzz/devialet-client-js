import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import { Config, ConfigError, ConfigProvider, Effect, Layer, Option, Schema } from "effect";
import { DosDeviceSchema } from "../schemas/DosDevice";
import { DosError } from "../schemas/DosError";
import { GroupStateSchema, GroupState } from "../schemas/GroupState";
import { Source, SourceSchema } from "../schemas/Source";
import { DosApiError } from "./DosApiError";
import { Mutations, Queries } from "./Endpoints";

const Volume = Schema.Struct({ volume: Schema.Number });
const NightMode = Schema.Struct({ nightMode: Schema.Literal("on", "off") });
const ErrorResponse = Schema.Struct({ error: DosError });
const Sources = Schema.Struct({ sources: Schema.Array(SourceSchema) });
const CurrentSourceResponse = Schema.Union(ErrorResponse, GroupStateSchema);

export class DosClient extends Effect.Service<DosClient>()('devialet/dos', {
    accessors: true,
    effect: Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;
        const address = yield* Config.string("devialet.address");
        const dosClient = client.pipe(
            HttpClient.mapRequest(HttpClientRequest.prependUrl(`http://${address}`)),
        );
        const normalizeResponse = (r: HttpClientResponse.HttpClientResponse): Effect.Effect<void, DosApiError, never> =>
            (r.status === 200) ? Effect.void : Effect.fail(new DosApiError("Operation failed"));

        const commandGenerator = (endpoint: string) => () => dosClient.post(endpoint)
            .pipe(
                Effect.mapError((e) => new DosApiError(e.message, e)),
                Effect.flatMap(normalizeResponse),
            );
        const queryGenerator = <A, I, R>(endpoint: string, schema: Schema.Schema<A, I, R>) => Effect.gen(function* () {
            const response = yield* dosClient.get(endpoint);
            return yield* HttpClientResponse.schemaBodyJson(schema)(response);
        }).pipe(Effect.mapError((e) => new DosApiError(e.message, e)));
        const mutationExecutor = (endpoint: string, payload: object) => () => HttpClientRequest.post(`http://${address}${endpoint}`).pipe(
            HttpClientRequest.bodyJson(payload),
            Effect.mapError(() => new DosApiError("Body was malformed")),
            Effect.flatMap(client.execute),
        ).pipe(Effect.flatMap(normalizeResponse), Effect.mapError(e => new DosApiError(e.message, e)));

        return {
            commands: {
                mute: commandGenerator(Mutations.MUTE),
                unmute: commandGenerator(Mutations.UNMUTE),
                next: commandGenerator(Mutations.NEXT_TRACK),
                previous: commandGenerator(Mutations.PREVIOUS_TRACK),
                play: commandGenerator(Mutations.PLAY),
                pause: commandGenerator(Mutations.PAUSE),
                volumeUp: commandGenerator(Mutations.VOLUME_UP),
                volumeDown: commandGenerator(Mutations.VOLUME_DOWN),
                volume: (volume: number) => mutationExecutor(Mutations.VOLUME, {
                    "volume": Math.max(Math.min(100, volume), 0)
                })(),
                nightMode: (nightMode: "on" | "off") => mutationExecutor(Mutations.NIGHT_MODE, {
                    "nightMode": nightMode
                })(),
                source: (source: Source) => commandGenerator(Mutations.SELECT_SOURCE(source))(),
            },
            queries: {
                volume: () : Effect.Effect<number, DosApiError, never> => queryGenerator(Queries.VOLUME, Volume).pipe(Effect.flatMap(v => Effect.succeed(v.volume))),
                sources: () => queryGenerator(Queries.SOURCES, Sources).pipe(Effect.flatMap(v => Effect.succeed(v.sources))),
                nightMode: (): Effect.Effect<boolean, DosApiError, never> => queryGenerator(Queries.NIGHT_MODE, NightMode).pipe(Effect.flatMap(v => Effect.succeed(v.nightMode === "on"))),
                state: (): Effect.Effect<Option.Option<GroupState>, DosApiError, never> => queryGenerator(Queries.CURRENT_SOURCE, CurrentSourceResponse).pipe(Effect.flatMap(r => {
                    if (r instanceof GroupStateSchema) {
                        return Effect.succeed(Option.some(r as GroupState));
                    }
                    return Effect.succeedNone;
                })),
            }
        };
    })
}) {
    static Live = Layer.provide(DosClient.Default, FetchHttpClient.layer);
    static config = (leader: string | DosDeviceSchema) => Effect.withConfigProvider(
        ConfigProvider.fromJson({ "devialet.address": (typeof leader === "string") ? leader : leader.address })
    );
    static create(leader: string | DosDeviceSchema): Effect.Effect<DosClient, ConfigError.ConfigError, never> {
        return Effect.gen(function* () {
            return yield* DosClient;
        }).pipe(
            Effect.provide(DosClient.Live),
            DosClient.config(leader),
        );
    }
}