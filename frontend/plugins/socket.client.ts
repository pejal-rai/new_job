// plugins/socket.client.ts
import { io } from "socket.io-client";

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig();
    const socket = io(config.public.apiBase.replace("/api", ""), {
        withCredentials: true,
        autoConnect: false,
    });

    return {
        provide: {
            socket,
        },
    };
}); 