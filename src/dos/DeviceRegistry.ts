import { DeviceGroup } from "../schemas/DeviceGroup";
import { DosDevice } from "../schemas/DosDevice";

export type DevialetDeviceFilter = (d: DosDevice) => boolean;

export class DevialetDeviceRegistry {
    private registry: Map<string, DosDevice> = new Map();

    public registerDevice(device: DosDevice): void {
        this.registry.set(device.id, device);
    }

    public hasDevice(id: string) {
        return this.registry.has(id);
    }

    public getDevice(id: string): DosDevice | undefined {
        return this.registry.get(id);
    }

    public unregisterDevice(idOrFilter: string | DevialetDeviceFilter): void {
        if (typeof idOrFilter === "string") {
            this.registry.delete(idOrFilter);
            return;
        }
        const device = Array.from(this.registry.values()).find(f => idOrFilter(f));
        if (device != undefined) {
            this.registry.delete(device.id);
        }
    }

    public devices(): DosDevice[] {
        return Array.from(this.registry.values());
    }

    public groups(): DeviceGroup[] {
        return [...Map.groupBy(this.registry, (v) => v[1].information.groupId).values()].map(group => {
            const leader = group.find(l => l[1].information.isSystemLeader)?.[1];
            if (leader === undefined) {
                return null;
            }
            return {
                leader: leader,
                members: Array.from(group.map(v => v[1]))
            };
        }).filter(d => d != null);
    }
}