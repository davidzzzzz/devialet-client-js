import { Effect } from "effect";
import { DosDiscoveryService } from "../src/dos/DosDiscoveryService";
import { DosClient } from "../src/dos/DosClient";

Effect.gen(function*() {
    const discovery = yield* DosDiscoveryService;
    const groups = yield* discovery.groups();
    console.log(groups);
    for(const group of groups) {
        const client = yield* DosClient.create(group.leader);
        const state = yield* client.queries.state();
        console.log(state);
    }
});