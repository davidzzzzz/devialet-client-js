export enum SourceTypes {
    Phono = "phono",
    Line = "line",
    DigitalLeft = "digital_left",
    DigitalRight = "digital_right",
    Optical = "optical",
    OpticalJack = "opticaljack",
    Airplay = "airplay2",
    Bluetooth = "bluetooth",
    UPnP = "upnp",
    Raat = "raat",
    SpotifyConnect = "spotifyconnect"
}

export const isAutoDetectedSource = (source: SourceTypes): boolean => source !== SourceTypes.Phono && source !== SourceTypes.Line

export const isPhysicalSource = (source: SourceTypes): boolean => source === SourceTypes.Phono || source === SourceTypes.Line || source === SourceTypes.DigitalLeft || source === SourceTypes.DigitalRight || source === SourceTypes.Optical || source === SourceTypes.OpticalJack

export const isNonPhysicalSource = (source: SourceTypes): boolean => !isPhysicalSource(source)