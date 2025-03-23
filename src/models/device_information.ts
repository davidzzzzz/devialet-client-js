export type DevialetDevice = {
    readonly id: string;
    readonly hostname: string;
    readonly address: string;
    readonly port: number;
    readonly information: ReadonlyDeviceInformation;
}

export type DevialetGroup = {
    readonly leader: DevialetDevice;
    readonly members: DevialetDevice[];
}
export type ReadonlyDeviceInformation = {
    readonly [K in keyof DeviceInformation]: DeviceInformation[K];
};
export type DeviceInformation = {
    availableFeatures: string[];
    deviceId: string;
    deviceName: string;
    firmwareFamily: string;
    groupId: string;
    installationId: string;
    ipControlVersion: string;
    isSystemLeader: boolean;
    model: string;
    modelFamily: string;
    powerRating: string;
    release: {
        buildType: string;
        canonicalVersion: string;
        version: string;
    };
    role: string;
    serial: string;
    setupState: string;
    systemId: string;
}