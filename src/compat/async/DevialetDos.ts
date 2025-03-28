import { ConfigError, Effect } from "effect";
import { DevialetDevice } from "../../schemas/DevialetDevice";
import { createDosClient, DosClient } from "../../dos/DosClient";
import { Source } from "../../schemas/Source";
import { GroupState } from "../../schemas/GroupState";

export class DevialetDos {
    private clientAccess: Effect.Effect<DosClient, ConfigError.ConfigError, never>;
    
    constructor(leader: string | DevialetDevice) {
        this.clientAccess = createDosClient(leader);
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

    async setSource(source: Source): Promise<void> {
        const client = await this.getClient();
        return Effect.runPromise(client.commands.source(source));
    }

    // Queries
    async getVolume(): Promise<number> {
        const client = await this.getClient();
        return Effect.runPromise(client.queries.volume());
    }

    async getSource(): Promise<Source> {
        const client = await this.getClient();
        return Effect.runPromise(client.queries.source());
    }

    async getNightMode(): Promise<boolean> {
        const client = await this.getClient();
        return Effect.runPromise(client.queries.nightMode());
    }

    async getState(): Promise<GroupState> {
        const client = await this.getClient();
        return Effect.runPromise(client.queries.state());
    }
}