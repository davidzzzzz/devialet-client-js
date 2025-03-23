import axios, { AxiosInstance } from "axios";
import { Mutations, Queries } from "./endpoints";
import { GroupState, Source } from "../models/source";
import { DevialetDevice } from "../models/device_information";

type Volume = {
    volume: number;
}

type NightMode = {
    nightMode: "on" | "off"
}

export class Devialet {
    private httpClient: AxiosInstance;

    constructor(leader: string | DevialetDevice) {
        const address = () => {
            if (typeof leader === "string") {
                return leader;
            } else {
               return leader.address;
            }
        };
        this.httpClient = axios.create({ baseURL: `http://${address()}` });
    }

    nightMode(enabled: boolean): Promise<void> {
        return this.httpClient.post(Mutations.VOLUME_UP, {
            "nightMode": enabled ? "on" : "off"
        });
    }
    async isNightModeEnabled(): Promise<boolean> {
        const m = await this.httpClient.get<NightMode>(Queries.NIGHT_MODE);
        return m.data.nightMode === "on";
    }
    source(source: Source): Promise<void> {
        return this.httpClient.post(Mutations.SELECT_SOURCE(source));
    }
    async getVolume(): Promise<number> {
        const v = await this.httpClient.get<Volume>(Queries.VOLUME);
        return v.data.volume;
    }
    volume(volume: number): Promise<void> {
        if (volume < 0 || volume > 100) {
            return Promise.reject("Volume must be between 0-100");
        }
        return this.httpClient.post(Mutations.VOLUME_UP, {
            "volume": volume
        });
    }
    volumeUp(): Promise<void> {
        return this.httpClient.post(Mutations.VOLUME_UP);
    }
    volumeDown(): Promise<void> {
        return this.httpClient.post(Mutations.VOLUME_DOWN);
    }
    async getAllSources(): Promise<Source[]> {
        const d = await this.httpClient.get<Source[]>(Queries.SOURCES);
        return d.data;
    }
    async getCurrentState(): Promise<GroupState> {
        const d = await this.httpClient.get<GroupState>(Queries.CURRENT_SOURCE);
        return d.data;
    }
    previous(): Promise<void> {
        return this.httpClient.post(Mutations.PREVIOUS_TRACK);
    }
    next(): Promise<void> {
        return this.httpClient.post(Mutations.NEXT_TRACK);
    }
    mute(): Promise<void> {
        return this.httpClient.post(Mutations.MUTE);
    }
    unmute(): Promise<void> {
        return this.httpClient.post(Mutations.UNMUTE);
    }

    play(): Promise<void> {
        return this.httpClient.post(Mutations.PLAY);
    }

    pause(): Promise<void> {
        return this.httpClient.post(Mutations.PAUSE);
    }
}
