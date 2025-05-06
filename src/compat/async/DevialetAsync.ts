import { ConfigError, Effect, Option } from "effect";
import { DosClient } from "../../dos/DosClient";
import { DosDiscoveryService } from "../../dos/DosDiscoveryService";
import { DeviceGroup } from "../../schemas/DeviceGroup";
import { DosDevice } from "../../schemas/DosDevice";
import { GroupState } from "../../schemas/GroupState";
import { Source } from "../../schemas/Source";
import { DosDeviceService } from "../../dos/DosDeviceService";
import { DeviceInformation } from "../../schemas/DeviceInformation";

export interface DosClientAsync {
    /**
     * Mutes the device.
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     * @throws {DosApiError}
     */
    mute(): Promise<void>;
    /**
     * Unmutes the device.
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     * @throws {DosApiError}
     */
    unmute(): Promise<void>;
    /**
     * Skips to the next track in the playlist.
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     * @throws {DosApiError}
     */
    next(): Promise<void>;
    /**
     * Skips to the previous track in the playlist.
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     * @throws {DosApiError}
     */
    previous(): Promise<void>;
    /**
     * Plays the current track.
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     * @throws {DosApiError}
     */
    play(): Promise<void>;
    /**
     * Pauses the current track.
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     * @throws {DosApiError}
     */
    pause(): Promise<void>;
    /**
     * Increases the volume of the device.
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     * @throws {DosApiError}
     */
    volumeUp(): Promise<void>;
    /**
     *  Decreases the volume of the device.
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     * @throws {DosApiError}
     */
    volumeDown(): Promise<void>;
    /**
     * Sets the volume of the device.
     * @param {number} volume - The volume level to set (0-100).
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     */
    setVolume(volume: number): Promise<void>;
    /**
     * Sets the mute state of the device.
     * @param {boolean} mute - The mute state to set (true for mute, false for unmute).
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     */
    setMute(mute: boolean): Promise<void>;
    /**
     * Sets the night mode of the device.
     * @param {"on" | "off"} nightMode - The night mode setting ("on" or "off").
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     * @throws {DosApiError}
     */
    setNightMode(nightMode: "on" | "off"): Promise<void>;
    /**
     *  Sets the source of the device.
     * @param {Source} source - The source to set.
     * @returns {Promise<void>} - A promise that resolves when the command is executed.
     * @throws {DosApiError}
     */
    setSource(source: Source): Promise<void>;
    /**
     * Gets the current volume of the device.
     * @throws {DosApiError}
     * @throws {ConfigError.ConfigError} - If the command fails.
     */
    getVolume(): Promise<number>;
    /**
     * Gets the current source of the device.
     * @returns {Promise<Source[]>} - A promise that resolves to the current sources.
     * @throws {DosApiError}
     */
    getSources(): Promise<readonly Source[]>;
    /**
     *  Gets the current night mode of the device.
     * @returns {Promise<boolean>} - A promise that resolves to true if night mode is enabled, false otherwise.
     * @throws {DosApiError}
     */
    getNightMode(): Promise<boolean>;
    /**
     * Gets the current state of the device.
     * @returns {Promise<GroupState | undefined>} - A promise that resolves to the current state of the device.
     * @throws {DosApiError}
     */
    getCurrentState(): Promise<GroupState | undefined>;
}


class DosClientAsyncImpl implements DosClientAsync {
    private clientAccess: Effect.Effect<DosClient, ConfigError.ConfigError, never>;

    constructor(leader: string | DosDevice) {
        this.clientAccess = DosClient.create(leader);
    }

    private async getClient(): Promise<DosClient> {
        return Effect.runPromise(this.clientAccess);
    }

    async mute(): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.mute());
    }

    async unmute(): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.unmute());
    }

    async next(): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.next());
    }

    async previous(): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.previous());
    }

    async play(): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.play());
    }

    async pause(): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.pause());
    }

    async volumeUp(): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.volumeUp());
    }

    async volumeDown(): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.volumeDown());
    }

    async setVolume(volume: number): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.volume(volume));
    }

    async setMute(mute: boolean): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(mute ? client.commands.mute() : client.commands.unmute());
    }

    async setNightMode(nightMode: "on" | "off"): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.nightMode(nightMode));
    }

    async setSource(source: Source): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.source(source));
    }

    async getVolume(): Promise<number> {
        const client = await this.getClient();
        return Effect.runPromise(client.queries.volume());
    }

    async getSources(): Promise<readonly Source[]> {
        const client = await this.getClient();
        return Effect.runPromise(client.queries.sources());
    }

    async getNightMode(): Promise<boolean> {
        const client = await this.getClient();
        return Effect.runPromise(client.queries.nightMode());
    }

    async getCurrentState(): Promise<GroupState | undefined> {
        const client = await this.getClient();
        return Effect.runPromise(client.queries.state().pipe(Effect.map(
            state => Option.isSome(state) ? state.value : undefined
        )));
    }
}


/**
 * DosDiscoveryServiceAsync class for discovering Devialet devices on the network.
 */
export interface DosDiscoveryServiceAsync {
    /**
     * Gets the list of discovered devices.
     * @returns {Promise<DeviceGroup[]>} - A promise that resolves to an array of discovered devices.
     * @throws {DosApiError}
     */
    getDevices(): Promise<DeviceGroup[]>
}

class DosDiscoveryServiceAsyncImpl implements DosDiscoveryServiceAsync {
    private service: Effect.Effect<DosDiscoveryService, never, never>;
    constructor() {
        this.service = DosDiscoveryService.create();
    }

    getDevices(): Promise<DeviceGroup[]> {
        return Effect.runPromise(this.service.pipe(Effect.flatMap(s => s.groups())));
    }
}

export interface DosDeviceServiceAsync {
    getInformation(idAddress: string): Promise<DeviceInformation>;
}

class DosDeviceServiceAsyncImpl implements DosDeviceServiceAsync {
    private service: Effect.Effect<DosDeviceService, never, never>;
    constructor() {
        this.service = DosDeviceService.create();
    }

    getInformation(idAddress: string): Promise<DeviceInformation> {
        return Effect.runPromise(this.service.pipe(Effect.flatMap(s => s.queryDevice(idAddress))));
    }
}

export const DevialetAsync = {
    createDosClient: (leader: string | DosDevice): DosClientAsync => new DosClientAsyncImpl(leader),
    createDiscoveryClient: (): DosDiscoveryServiceAsync => new DosDiscoveryServiceAsyncImpl(),
    createDeviceService: (): DosDeviceServiceAsync => new DosDeviceServiceAsyncImpl()
};
