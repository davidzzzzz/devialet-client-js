import { Effect, Runtime } from "effect";
import { DosDiscoveryService } from "../src/dos/DosDiscoveryService";
import { DosClient } from "../src/dos/DosClient";

const program = Effect.gen(function*() {
    const discovery = yield* DosDiscoveryService.create();
    const groups = yield* discovery.groups();
    console.log(groups);
    for(const group of groups) {
        const client = yield* DosClient.create(group.leader);
        const state = yield* client.queries.volume();
        console.log(state);
    }
});

Runtime.runPromise(Runtime.defaultRuntime)(program);