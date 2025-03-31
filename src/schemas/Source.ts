import { Schema } from "effect";
import { SourceTypes } from "./SourceTypes";

export class SourceSchema extends Schema.Class<SourceSchema>("devialet/source")({
    deviceId: Schema.String,
    sourceId: Schema.String,
    type: Schema.Enums(SourceTypes)
}) { }

export type Source = typeof SourceSchema.Type;