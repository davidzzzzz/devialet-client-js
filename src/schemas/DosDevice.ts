import { DeviceInformation } from "./DeviceInformation";

export type DosDevice = {
    id: string;
    hostname: string;
    address: string;
    port: number;
    information: DeviceInformation;
}

