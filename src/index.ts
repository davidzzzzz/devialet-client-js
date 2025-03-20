import { createHttpDevialetClient } from "./api/client";

createHttpDevialetClient({mode: "mDNS"}).then(client => {
    client.play();
});

