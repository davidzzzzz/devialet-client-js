import { Schema } from "effect";
import { DevialetDevice } from "./DevialetDevice";

export const DevialetGroup = Schema.Struct(
    {
    leader: DevialetDevice,
    members: Schema.Array(DevialetDevice)
    }
);

export type DevialetGroup = Schema.Schema.Type<typeof DevialetGroup>;
