import { Devialet } from "./api/client";
import { DevialetmDNSResolver } from "./api/resolver";

new DevialetmDNSResolver().groups().then(groups => {
    const group = groups[0];
    const client = new Devialet(group.leader);
    client.pause().then(data => console.log(data));
});

