import { DosDeviceSchema } from "../schemas/DosDevice";
import { DeviceGroupSchema } from "../schemas/DeviceGroup";

export type DevialetDeviceFilter = (d: DosDeviceSchema) => boolean;

export class DevialetDeviceRegistry {
    private registry: Map<string, DosDeviceSchema> = new Map();

    public registerDevice(device: DosDeviceSchema): void {
        this.registry.set(device.id, device);
    }

    public hasDevice(id: string) {
        return this.registry.has(id);
    }

    public getDevice(id: string): DosDeviceSchema | undefined {
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

    public devices(): DosDeviceSchema[] {
        return Array.from(this.registry.values());
    }

    public groups() : DeviceGroupSchema[] {
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