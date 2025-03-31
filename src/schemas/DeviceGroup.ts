import { Schema } from "effect";
import { DosDeviceSchema } from "./DosDevice";

export class DeviceGroupSchema extends Schema.Class<DeviceGroupSchema>("devialet/device/group")({
    leader: DosDeviceSchema,
    members: Schema.Array(DosDeviceSchema)
}) { }

export type DeviceGroup = typeof DeviceGroupSchema.Type;