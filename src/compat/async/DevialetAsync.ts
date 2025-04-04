import { ConfigError, Effect, Option } from "effect";
import { DosClient } from "../../dos/DosClient";
import { DosDiscoveryService } from "../../dos/DosDiscoveryService";
import { DeviceGroup } from "../../schemas/DeviceGroup";
import { DosDevice } from "../../schemas/DosDevice";
import { GroupState } from "../../schemas/GroupState";
import { Source } from "../../schemas/Source";


class DevialetDos {
    private clientAccess: Effect.Effect<DosClient, ConfigError.ConfigError, never>;

    constructor(leader: string | DosDevice) {
        this.clientAccess = DosClient.create(leader);
    }

    private async getClient(): Promise<DosClient> {
        return Effect.runPromise(this.clientAccess);
    }

    /**
     * Mutes the device.
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     * @throws {ConfigError.ConfigError} - If the command fails.
     */
    async mute(): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.mute());
    }

    /**
     * Unmutes the device.
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     * @throws {ConfigError.ConfigError} - If the command fails.
     */
    async unmute(): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.unmute());
    }

    /**
     * Skips to the next track in the playlist.
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     * @throws {ConfigError.ConfigError} - If the command fails.
     */
    async next(): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.next());
    }

    /**
     * Skips to the previous track in the playlist.
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     * @throws {ConfigError.ConfigError} - If the command fails.
     */
    async previous(): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.previous());
    }

    /**
     * Plays the current track.
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     * @throws {ConfigError.ConfigError} - If the command fails.
     */
    async play(): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.play());
    }

    /**
     * Pauses the current track.
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     * @throws {ConfigError.ConfigError} - If the command fails.
     */
    async pause(): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.pause());
    }

    /**
     * Increases the volume of the device.
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     * @throws {ConfigError.ConfigError} - If the command fails.
     */
    async volumeUp(): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.volumeUp());
    }

    /**
     *  Decreases the volume of the device.
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     * @throws {ConfigError.ConfigError} - If the command fails.
     */
    async volumeDown(): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.volumeDown());
    }

    /**
     * Sets the volume of the device.
     * @param {number} volume - The volume level to set (0-100).
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     */
    async setVolume(volume: number): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.volume(volume));
    }

    /**
     * Sets the night mode of the device.
     * @param {"on" | "off"} nightMode - The night mode setting ("on" or "off").
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     * @throws {ConfigError.ConfigError} - If the command fails.
     */
    async setNightMode(nightMode: "on" | "off"): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.nightMode(nightMode));
    }

    /**
     *  Sets the source of the device.
     * @param {Source} source - The source to set.
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     * @throws {ConfigError.ConfigError} - If the command fails.
     */
    async setSource(source: Source): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.source(source));
    }

    /**
     * Gets the current volume of the device.
     * @returns {Promise<number>} - A promise that resolves to the current volume level (0-100).
     * @throws {ConfigError.ConfigError} - If the command fails.
     */
    async getVolume(): Promise<number> {
        const client = await this.getClient();
        return Effect.runPromise(client.queries.volume());
    }

    /**
     * Gets the current source of the device.
     * @returns {Promise<Source>} - A promise that resolves to the current source.
     * @throws {ConfigError.ConfigError} - If the command fails.
     */
    async getSources(): Promise<readonly Source[]> {
        const client = await this.getClient();
        return Effect.runPromise(client.queries.sources());
    }

    /**
     *  Gets the current night mode of the device.
     * @returns {Promise<boolean>} - A promise that resolves to true if night mode is enabled, false otherwise.
     * @throws {ConfigError.ConfigError} - If the command fails.
     */
    async getNightMode(): Promise<boolean> {
        const client = await this.getClient();
        return Effect.runPromise(client.queries.nightMode());
    }

    /**
     * Gets the current state of the device.
     * @returns {Promise<GroupState | undefined>} - A promise that resolves to the current state of the device.
     * @throws {ConfigError.ConfigError} - If the command fails.
     */
    async getCurrentState(): Promise<GroupState | undefined> {
        const client = await this.getClient();
        return Effect.runPromise(client.queries.state().pipe(Effect.map(
            state => Option.isSome(state) ? state.value : undefined
        )));
    }
}

/**
 * DevialetDiscovery class for discovering Devialet devices on the network.
 */
class DevialetDiscovery {
    private service: Effect.Effect<DosDiscoveryService, never, never>;
    constructor() {
        this.service = DosDiscoveryService.create();
    }

    /**
     * Gets the list of discovered devices.
     * @returns {Promise<DeviceGroup[]>} - A promise that resolves to an array of discovered devices.
     * @throws {ConfigError.ConfigError} - If the command fails.
     */
    getDevices(): Promise<DeviceGroup[]> {
        return Effect.runPromise(this.service.pipe(Effect.flatMap(s => s.groups())));
    }
}

export const DevialetAsync = { 
    DevialetDos, DevialetDiscovery 
};
