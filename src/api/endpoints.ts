import { Source } from "../models/source";

const API_PREFIX = "/ipcontrol/v1";
const DEVICES_PREFIX = `${API_PREFIX}/devices`;
const SYSTEM_PREFIX = `${API_PREFIX}/system/current`;
const GROUPS_PREFIX = `${API_PREFIX}/groups/current`;

export const Mutations = {
    TURN_OFF: `${SYSTEM_PREFIX}/powerOff`,
    VOLUME_UP: `${SYSTEM_PREFIX}/sources/current/soundControl/volumeUp`,
    VOLUME_DOWN: `${SYSTEM_PREFIX}/sources/current/soundControl/volumeDown`,
    VOLUME: `${SYSTEM_PREFIX}/sources/current/soundControl/volume`,
    NIGHT_MODE: `${SYSTEM_PREFIX}/settings/audio/nightMode`,
    MUTE: `${GROUPS_PREFIX}/sources/current/playback/mute`,
    SEEK: `${GROUPS_PREFIX}/sources/current/playback/position`,
    PLAY: `${GROUPS_PREFIX}/sources/current/playback/play`,
    PAUSE: `${GROUPS_PREFIX}/sources/current/playback/pause`,
    STOP: `${GROUPS_PREFIX}/sources/current/playback/pause`,
    PREVIOUS_TRACK: `${GROUPS_PREFIX}/sources/current/playback/previous`,
    NEXT_TRACK: `${GROUPS_PREFIX}/sources/current/playback/next`,
    UNMUTE: `${GROUPS_PREFIX}/sources/current/playback/unmute`,
    SELECT_SOURCE: (source: Source) => `${GROUPS_PREFIX}/sources/${source.sourceId}/playback/play`,
};
export const Queries = {
    GENERAL_INFO: `${DEVICES_PREFIX}/current`,
    VOLUME: `${SYSTEM_PREFIX}/sources/current/soundControl/volume`,
    NIGHT_MODE: `${SYSTEM_PREFIX}/settings/audio/nightMode`,
    EQUALIZER: `${SYSTEM_PREFIX}/settings/audio/equalizer`,
    POWER: `${SYSTEM_PREFIX}/power`,
    INPUTS: `${SYSTEM_PREFIX}/sources`,
    SOUND_MODE: `${SYSTEM_PREFIX}/settings/audio/soundMode`,
    SOURCES: `${GROUPS_PREFIX}/sources`,
    CURRENT_SOURCE: `${GROUPS_PREFIX}/sources/current`,
    CURRENT_POSITION: `${GROUPS_PREFIX}/sources/current/playback/position`,
};
