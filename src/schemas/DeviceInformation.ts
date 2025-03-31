import { Schema } from "effect";

export class DeviceInformationSchema extends Schema.Class<DeviceInformationSchema>("devialet/device/information")({
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
    release: Schema.Struct(
        {
            buildType: Schema.String,
            canonicalVersion: Schema.String,
            version: Schema.String,
        }
    ),
    role: Schema.String,
    serial: Schema.String,
    setupState: Schema.String,
    systemId: Schema.String,
}) {}

export type DeviceInformation = typeof DeviceInformationSchema.Type;
