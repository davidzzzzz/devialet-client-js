import { Schema } from "effect";
import { DeviceInformationSchema } from "./DeviceInformation";

export class DosDeviceSchema extends Schema.Class<DosDeviceSchema>("devialet/device")({
    id: Schema.String,
    hostname: Schema.String,
    address: Schema.String,
    port: Schema.Number,
    information: DeviceInformationSchema
}) { }

export type DosDevice = typeof DosDeviceSchema.Type;

