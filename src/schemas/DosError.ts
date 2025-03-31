import { Schema } from "effect";

export class DosError extends Schema.Class<DosError>("devialet/error")({
    code: Schema.String,
    message: Schema.String,
    details: Schema.optional(Schema.Any),
}) { }