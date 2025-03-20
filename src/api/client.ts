import { DevialetConfig } from "../config/devialet_config";
import axios, { AxiosInstance } from "axios";
import { Mutations } from "./endpoints";
import { defaultResolver, DevialetGroup } from "./resolver";
// import { Sources as Source } from "./constants";

export interface DevialetClient {
    // getVolume(): Promise<number>;
    // volume(volume: number): Promise<void>;
    // getNightMode(): Promise<boolean>;
    // nightMode(enabled: boolean): Promise<void>;
    // getCurrentSource(): Promise<Source>;
    // getAllSources(): Promise<Source[]>;
    // getCurrentPosition(): Promise<number>;
    // volumeUp(): Promise<void>;
    // volumeDown(): Promise<void>;
    // mute(): Promise<void>;
    play(): Promise<void>;
    pause(): Promise<void>;
    // previous(): Promise<void>;
    // next(): Promise<void>;
    // unmute(): Promise<void>;
    // setSource(source: Source): Promise<void>;
}

class HttpDevialetClient implements DevialetClient {
    private httpClient: AxiosInstance;

    constructor(baseURL: string) {
        this.httpClient = axios.create({ baseURL });
    }

    async play(): Promise<void> {
        await this.httpClient.post(Mutations.PLAY);
    }

    async pause(): Promise<void> {
        await this.httpClient.post(Mutations.PAUSE);
    }
}

export async function createHttpDevialetClient(config: DevialetConfig): Promise<DevialetClient> {
    if (config.mode === "ip") {
        if (!config.ipAddress) {
            throw new Error("Invalid configuration for HTTP Devialet client");
        }
        return Promise.resolve(new HttpDevialetClient(config.ipAddress));
    }

    const resolver = config.mDNSResolver ?? defaultResolver();
    const groups = await resolver.groups();
    const first = groups.next()?.value as DevialetGroup;
    return Promise.resolve(new HttpDevialetClient(`http://${first.address}`));
}
