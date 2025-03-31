import { Schema } from "effect";
import { SourceSchema } from "./Source";

export class GroupStateSchema extends Schema.Class<GroupStateSchema>("devialet/groupState")({
    availableOperations: Schema.Array(Schema.Literal('play', 'pause', 'previous', 'next')),
    metadata: Schema.optional(Schema.Struct(
        {
            album: Schema.String,
            artist: Schema.String,
            coverArtDataPresent: Schema.Boolean,
            duration: Schema.Number,
            mediaType: Schema.String,
            title: Schema.String,
        }
    )),
    muteState: Schema.Literal("muted", "unmuted"),
    peerDeviceName: Schema.String,
    playingState: Schema.Literal("playing", "pause"),
    source: SourceSchema
}) {}

export type GroupState = typeof GroupStateSchema.Type;
