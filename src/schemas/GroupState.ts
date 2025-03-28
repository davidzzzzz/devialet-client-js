import { Schema } from "effect";
import { Source } from "./Source";

export const SourceTrackMetadata = Schema.Struct(
    {
        album: Schema.String,
        artist: Schema.String,
        coverArtDataPresent: Schema.Boolean,
        duration: Schema.Number,
        mediaType: Schema.String,
        title: Schema.String,
    }
);

export type SourceTrackMetadata = Schema.Schema.Type<typeof SourceTrackMetadata>;

export const GroupState = Schema.Struct({
    availableOperations: Schema.Array(Schema.Literal("play", "pause", "next", "previous","seek")),
    metadata: Schema.optional(SourceTrackMetadata),
        muteState: Schema.Literal("muted", "unmuted"),
    peerDeviceName: Schema.String,
        playingState: Schema.Literal("playing", "pause"),
    source: Source
});

export type GroupState = Schema.Schema.Type<typeof GroupState>;
