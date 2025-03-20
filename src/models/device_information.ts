export interface DeviceInformation {
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