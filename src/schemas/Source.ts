import { Schema } from "effect";
import { SourceTypes } from "./SourceTypes";

export const Source = Schema.Struct(
    {
        deviceId: Schema.String,
        sourceId: Schema.String,
        type: Schema.Enums(SourceTypes)
    }
);

export type Source = Schema.Schema.Type<typeof Source>;