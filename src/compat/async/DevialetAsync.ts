import { ConfigError, Effect, Option } from "effect";
import { DosClient } from "../../dos/DosClient";
import { DosDiscoveryService } from "../../dos/DosDiscoveryService";
import { DeviceGroupSchema } from "../../schemas/DeviceGroup";
import { DosDeviceSchema } from "../../schemas/DosDevice";
import { GroupStateSchema } from "../../schemas/GroupState";
import { SourceSchema } from "../../schemas/Source";

class DevialetDos {
    private clientAccess: Effect.Effect<DosClient, ConfigError.ConfigError, never>;

    constructor(leader: string | DosDeviceSchema) {
        this.clientAccess = DosClient.create(leader);
    }

    private async getClient(): Promise<DosClient> {
        return Effect.runPromise(this.clientAccess);
    }

    // Commands
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

    async setNightMode(nightMode: "on" | "off"): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.nightMode(nightMode));
    }

    async setSource(source: SourceSchema): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.source(source));
    }

    // Queries
    async getVolume(): Promise<number> {
        const client = await this.getClient();
        return Effect.runPromise(client.queries.volume());
    }

    async getSources(): Promise<readonly SourceSchema[]> {
        const client = await this.getClient();
        return Effect.runPromise(client.queries.sources());
    }

    async getNightMode(): Promise<boolean> {
        const client = await this.getClient();
        return Effect.runPromise(client.queries.nightMode());
    }

    async getCurrentState(): Promise<GroupStateSchema | undefined> {
        const client = await this.getClient();
        return Effect.runPromise(client.queries.state().pipe(Effect.map(
            state => Option.isSome(state) ? state.value : undefined
        )));
    }
}

class DevialetDiscovery {
    private service: Effect.Effect<DosDiscoveryService, never, never>;
    constructor() {
        this.service = DosDiscoveryService.create();
    }

    getDevices(): Promise<DeviceGroupSchema[]> {
        return Effect.runPromise(this.service.pipe(Effect.flatMap(s => s.groups())));
    }
}

export const DevialetAsync = { 
    DevialetDos, DevialetDiscovery 
};
