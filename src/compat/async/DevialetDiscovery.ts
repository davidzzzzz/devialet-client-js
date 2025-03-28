import { createDiscoveryService, DevialetDiscoveryService } from "../../discovery/DevialetDiscoveryService";
import { Effect } from "effect";
import { DevialetGroup } from "../../schemas/DevialetGroup";
export class DevialetDiscovery {
    service: Effect.Effect<DevialetDiscoveryService, never, never>;
    constructor() {
        this.service = createDiscoveryService();
    }

    getDevices(): Promise<DevialetGroup[]> {
        return Effect.runPromise(this.service.pipe(Effect.flatMap(s => s.groups())));
    }
}
