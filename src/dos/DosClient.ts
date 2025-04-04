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

/**
 * Client for interacting with Devialet Operating System (DOS) API
 * 
 * This service provides an interface for controlling Devialet audio devices over HTTP,
 * enabling commands like volume control, playback management, and retrieving device state.
 * 
 * @example
 * ```typescript
 * // Create a client using a device IP address
 * const client = await DosClient.create("192.168.1.100").pipe(Effect.runPromise);
 * 
 * // Execute commands
 * await client.commands.volumeUp().pipe(Effect.runPromise);
 * await client.commands.volume(50).pipe(Effect.runPromise);
 * await client.commands.play().pipe(Effect.runPromise);
 * 
 * // Retrieve device information
 * const volume = await client.queries.volume().pipe(Effect.runPromise);
 * const sources = await client.queries.sources().pipe(Effect.runPromise);
 * const state = await client.queries.state().pipe(Effect.runPromise);
 * ```
 */
export class DosClient extends Effect.Service<DosClient>()('devialet/dos', {
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
            /**
             * Commands for controlling the device.
             * These commands allow you to perform actions such as muting, changing volume, and controlling playback.
             */
            commands: {
                /**
                 * Mute the device.
                 * @returns {Effect.Effect<void, DosApiError, never>} - An effect that represents the command execution
                 */
                mute: commandGenerator(Mutations.MUTE),
                /**
                 * Unmute the device.
                 * @returns {Effect.Effect<void, DosApiError, never>} - An effect that represents the command execution
                 */
                unmute: commandGenerator(Mutations.UNMUTE),
                /**
                 * Move to the next track.
                 * @returns {Effect.Effect<void, DosApiError, never>} - An effect that represents the command execution
                 */
                next: commandGenerator(Mutations.NEXT_TRACK),
                /**
                 * Move to the previous track.
                 * @returns {Effect.Effect<void, DosApiError, never>} - An effect that represents the command execution
                 */
                previous: commandGenerator(Mutations.PREVIOUS_TRACK),
                /**
                 * Play the current track.
                 * @returns {Effect.Effect<void, DosApiError, never>} - An effect that represents the command execution
                 */
                play: commandGenerator(Mutations.PLAY),
                /**
                 * Pause the current track.
                 * @returns {Effect.Effect<void, DosApiError, never>} - An effect that represents the command execution
                 */
                pause: commandGenerator(Mutations.PAUSE),
                /**
                 * Increase the volume.
                 * @returns {Effect.Effect<void, DosApiError, never>} - An effect that represents the command execution
                 */
                volumeUp: commandGenerator(Mutations.VOLUME_UP),
                /**
                 * Decrease the volume.
                 * @returns {Effect.Effect<void, DosApiError, never>} - An effect that represents the command execution
                 */
                volumeDown: commandGenerator(Mutations.VOLUME_DOWN),
                /**
                 * Set the volume to a specific level. 
                 * @param {number} volume - The desired volume level (0-100). Will be clamped between 0 and 100.
                 * @returns {Effect.Effect<void, DosApiError, never>} - An effect that represents the command execution
                 */
                volume: (volume: number): Effect.Effect<void, DosApiError, never> => mutationExecutor(Mutations.VOLUME, {
                    "volume": Math.max(Math.min(100, volume), 0)
                })(),
                /**
                 * Set the night mode of the device.
                 * @param {("on" | "off")} nightMode - The desired night mode state.
                 * @returns {Effect.Effect<void, DosApiError, never>} - An effect that represents the command execution
                 */
                nightMode: (nightMode: "on" | "off"): Effect.Effect<void, DosApiError, never> => mutationExecutor(Mutations.NIGHT_MODE, {
                    "nightMode": nightMode
                })(),
                /**
                 * Select a specific source for playback.
                 * @param {Source} source - The source to select.
                 * @returns {Effect.Effect<void, DosApiError, never>} - An effect that represents the command execution
                 */
                source: (source: Source): Effect.Effect<void, DosApiError, never> => commandGenerator(Mutations.SELECT_SOURCE(source))(),
            },
            /**
             * Queries for retrieving information from the device.
             * These queries allow you to get the current state, volume level, and available sources.
             */
            queries: {
                /**
                 * Get the current volume level of the device.
                 * @returns {Effect.Effect<number, DosApiError, never>} - An effect that returns the current volume level   
                 */
                volume: () : Effect.Effect<number, DosApiError, never> => queryGenerator(Queries.VOLUME, Volume).pipe(Effect.flatMap(v => Effect.succeed(v.volume))),
                /**
                 * Get the list of available sources for the device.
                 * @returns {Effect.Effect<readonly Source[], DosApiError, never>} - An effect that returns the list of sources
                 */
                sources: (): Effect.Effect<readonly Source[], DosApiError, never> => queryGenerator(Queries.SOURCES, Sources).pipe(Effect.flatMap(v => Effect.succeed(v.sources))),
                /**
                 * Check if night mode is enabled.
                 * @returns {Effect.Effect<boolean, DosApiError, never>} - An effect that returns true if night mode is enabled, false otherwise
                 */
                nightMode: (): Effect.Effect<boolean, DosApiError, never> => queryGenerator(Queries.NIGHT_MODE, NightMode).pipe(Effect.flatMap(v => Effect.succeed(v.nightMode === "on"))),
                /**
                 * Get the current state of the device.
                 * @returns {Effect.Effect<Option.Option<GroupState>, DosApiError, never>} - An effect that returns the current state of the device
                 * or None if the state is not available
                 */
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
    /**
     * Creates a Layer pre-configured with required dependencies for the DosClient.
     * This layer provides the DosClient with a default HTTP client and configuration provider.
     */
    static Live = Layer.provide(DosClient.Default, FetchHttpClient.layer);
    /**
     * Creates a configuration provider for the DosClient.
     */
    static config = (leader: string | DosDeviceSchema) => Effect.withConfigProvider(
        ConfigProvider.fromJson({ "devialet.address": (typeof leader === "string") ? leader : leader.address })
    );
    /**
     * Creates a new instance of the DosClient.
     * @param {string | DosDeviceSchema} leader - The IP address of the device or a DosDeviceSchema object
     */
    static create(leader: string | DosDeviceSchema): Effect.Effect<DosClient, ConfigError.ConfigError, never> {
        return Effect.gen(function* () {
            return yield* DosClient;
        }).pipe(
            Effect.provide(DosClient.Live),
            DosClient.config(leader),
        );
    }
}