import { DeviceInformation } from "../models/device_information";
import axios from "axios";
import { Queries } from "./endpoints";

export interface DevialetDeviceClient {
    
    deviceInfo(ipAddress: string): Promise<DeviceInformation>;
}

class HttpDevialetDeviceClient implements DevialetDeviceClient {
    async deviceInfo(ipAddress: string): Promise<DeviceInformation> {
        const response = await axios.get<DeviceInformation>(`http://${ipAddress}${Queries.GENERAL_INFO}`);
        return response.data;
    }
}

export function defaultDeviceClient() : DevialetDeviceClient {
    return new HttpDevialetDeviceClient();
}