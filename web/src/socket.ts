import { io } from 'socket.io-client';

const url = import.meta.env.VITE_API_URL;
export const socket = io(url, {
    autoConnect: false,
});