export enum SourceTypes {
    Airplay = "airplay2",
    Bluetooth = "bluetooth",
    DigitalLeft = "digital_left",
    DigitalRight = "digital_right",
    Line = "line",
    UPnP = "upnp",
    Optical = "optical",
    OpticalLeft = "optical_left",
    OpticalRight = "optical_right",
    OpticalJack = "opticaljack",
    OpticalJackLeft = "opticaljack_left",
    OpticalJackRight = "opticaljack_right",
    Phono = "phono",
    Raat = "raat",
    SpotifyConnect = "spotifyconnect",
}

export type Source = {
    deviceId: string;
    sourceId: string;
    type: SourceTypes;
}

export type GroupState = {
    availableOperations: Array<"play"|"pause"| "next"|"previous"|"seek">;
    metadata?: {
        album: string;
        artist: string;
        coverArtDataPresent: boolean;
        duration: number;
        mediaType: string;
        title: string;
    };
    muteState: "unmuted" | "muted";
    peerDeviceName: string;
    playingState: "playing" | "paused";
    source: Source;
};