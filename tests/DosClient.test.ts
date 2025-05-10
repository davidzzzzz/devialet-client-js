import { Effect, Runtime } from "effect";
import { DosClient } from "../src/dos/DosClient";
import { MockDosServer } from "./server/MockDosServer";

const server = new MockDosServer();
const port = 3100;

beforeAll(async () => {
    await server.start(port);
});
afterAll(async () => {
    await server.stop();
});

describe("Dos Client API client", () => {
    it("should get the volume (50)", async () => {
        const program = Effect.gen(function*() {
            const client = yield* DosClient.create(`localhost:${port}`);
            return yield* client.queries.volume();
        });
        const volume = await Runtime.runPromise(Runtime.defaultRuntime)(program);
        expect(volume).toBeGreaterThanOrEqual(0);
        expect(volume).toBeLessThanOrEqual(100);
    });

    it("should get the night mode (on)", async () => {
        const program = Effect.gen(function*() {
            const client = yield* DosClient.create(`localhost:${port}`);
            return yield* client.queries.nightMode();
        });
        const nightMode = await Runtime.runPromise(Runtime.defaultRuntime)(program);
        expect(nightMode).toEqual(true);
    });

    it("should get the sources", async () => {
        const program = Effect.gen(function*() {
            const client = yield* DosClient.create(`localhost:${port}`);
            return yield* client.queries.sources();
        });
        const sources = await Runtime.runPromise(Runtime.defaultRuntime)(program);
        expect(sources).toEqual([{
            sourceId: "source1",
            deviceId: "device1",
            type: "airplay2",
        }, {
            sourceId: "source2",
            deviceId: "device2",
            type: "airplay2",
        }]); // Adjust based on mock data
    });

    // it("should mute the device", async () => {
    //     const program = Effect.gen(function*() {
    //         const client = yield* DosClient.create(`localhost:${port}`);
    //         yield* client.commands.mute();
    //     });
    //     await Runtime.runPromise(Runtime.defaultRuntime)(program);
    // });

    it("should unmute the device", async () => {
        const program = Effect.gen(function*() {
            const client = yield* DosClient.create(`localhost:${port}`);
            yield* client.commands.unmute();
        });
        await Runtime.runPromise(Runtime.defaultRuntime)(program);
    });

    it("should set the volume to 30", async () => {
        const program = Effect.gen(function*() {
            const client = yield* DosClient.create(`localhost:${port}`);
            yield* client.commands.volume(30);
        });
        await Runtime.runPromise(Runtime.defaultRuntime)(program);
    });

    it("should enable night mode", async () => {
        const program = Effect.gen(function*() {
            const client = yield* DosClient.create(`localhost:${port}`);
            yield* client.commands.nightMode("on");
        });
        await Runtime.runPromise(Runtime.defaultRuntime)(program);
    });

    it("should disable night mode", async () => {
        const program = Effect.gen(function*() {
            const client = yield* DosClient.create(`localhost:${port}`);
            yield* client.commands.nightMode("off");
        });
        await Runtime.runPromise(Runtime.defaultRuntime)(program);
    });

    it("should play the next track", async () => {
        const program = Effect.gen(function*() {
            const client = yield* DosClient.create(`localhost:${port}`);
            yield* client.commands.next();
        });
        await Runtime.runPromise(Runtime.defaultRuntime)(program);
    });

    it("should play the previous track", async () => {
        const program = Effect.gen(function*() {
            const client = yield* DosClient.create(`localhost:${port}`);
            yield* client.commands.previous();
        });
        await Runtime.runPromise(Runtime.defaultRuntime)(program);
    });
});
