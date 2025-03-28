import { Schema } from "effect";

export const Release = Schema.Struct(
    {
        buildType: Schema.String,
        canonicalVersion: Schema.String,
        version: Schema.String,
    }
);

export const DevialetDeviceInformation = Schema.Struct({
    availableFeatures: Schema.Array(Schema.String),
    deviceId: Schema.String,
    deviceName: Schema.String,
    firmwareFamily: Schema.String,
    groupId: Schema.String,
    installationId: Schema.String,
    ipControlVersion: Schema.String,
    isSystemLeader: Schema.Boolean,
    model: Schema.String,
    modelFamily: Schema.String,
    powerRating: Schema.String,
    release: Release,
    role: Schema.String,
    serial: Schema.String,
    setupState: Schema.String,
    systemId: Schema.String,
});

export type DevialetDeviceInformation = Schema.Schema.Type<typeof DevialetDeviceInformation>;

