import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import { Config, ConfigError, ConfigProvider, Effect, Schema } from "effect";
import { Mutations, Queries } from "./Endpoints";
import { DevialetDevice } from "../schemas/DevialetDevice";
import { Source } from "../schemas/Source";
import { GroupState } from "../schemas/GroupState";

const Volume = Schema.Struct({
    volume: Schema.Number,
});

const NightMode = Schema.Struct({
    nightMode: Schema.Literal("on", "off"),
});

export class DosClient extends Effect.Service<DosClient>()('devialet/dos', {
    accessors: true,
    effect: Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;
        const address = yield* Config.string("devialet.address");
        const dosClient = client.pipe(
            HttpClient.mapRequest(HttpClientRequest.prependUrl(`http://${address}`))
        );

        const normalizeResponse = (r: HttpClientResponse.HttpClientResponse): Effect.Effect<void, string, never> =>
            (r.status === 200) ? Effect.void : Effect.fail("Operation failed");

        const commandGenerator = (endpoint: string) => () => dosClient.post(endpoint).pipe(Effect.flatMap(normalizeResponse));
        const queryGenerator = <A, I, R>(endpoint: string, schema: Schema.Schema<A, I, R>) => Effect.gen(function* () {
            const response = yield* dosClient.get(endpoint);
            return yield* HttpClientResponse.schemaBodyJson(schema)(response);
        });
        const mutationExecutor = (endpoint: string, payload: object) => () => HttpClientRequest.post(endpoint).pipe(
            HttpClientRequest.bodyJson(payload),
            Effect.flatMap(client.execute),
        ).pipe(Effect.flatMap(normalizeResponse));

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
                volume: () => queryGenerator(Queries.VOLUME, Volume).pipe(Effect.flatMap(v => Effect.succeed(v.volume))),
                source: () => queryGenerator(Queries.SOURCES, Source),
                nightMode: () => queryGenerator(Queries.NIGHT_MODE, NightMode).pipe(Effect.flatMap(v => Effect.succeed(v.nightMode === "on"))),
                state: () => queryGenerator(Queries.CURRENT_SOURCE, GroupState),
            }
        };
    })
}) { }

export function createDosClient(leader: string | DevialetDevice): Effect.Effect<DosClient, ConfigError.ConfigError, never> {
    return Effect.gen(function*() {
        return yield* DosClient;
    }).pipe(
        Effect.provide(DosClient.Default),
        Effect.provide(FetchHttpClient.layer),
        Effect.withConfigProvider(
            ConfigProvider.fromJson({ "devialet.address": (typeof leader === "string") ? leader : leader.address })
        )
    );
} 