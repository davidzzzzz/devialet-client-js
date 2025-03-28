import { Schema } from "effect";
import { DevialetDeviceInformation } from "./DevialetDeviceInformation";

export const DevialetDevice = Schema.Struct(
    {
        id: Schema.String,
        hostname: Schema.String,
        address: Schema.String,
        port: Schema.Number,
        information: DevialetDeviceInformation
    }
);

export type DevialetDevice = Schema.Schema.Type<typeof DevialetDevice>;



