import { DosDevice } from "./DosDevice";

export type DeviceGroup = {
    leader: DosDevice;
    members: DosDevice[];
};