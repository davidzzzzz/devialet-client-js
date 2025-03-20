import { DevialetGroupResolver } from "../api/resolver";

export interface DevialetConfig {
    ipAddress?: string;
    mode: 'ip' | 'mDNS',
    mDNSResolver?: DevialetGroupResolver,
}