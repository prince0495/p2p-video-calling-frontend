import { createContext, useMemo, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "../types";

type SocketContextType = {
    socket: Socket<ClientToServerEvents, ServerToClientEvents>;
};

export const SocketContext = createContext<SocketContextType | null>(null)

export const SocketProvider = ({children} : {children: ReactNode}) => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = useMemo(()=> {
        return io(import.meta.env.VITE_BACKEND_URL, {
            withCredentials: true
        })
    },[])
    
    return <SocketContext.Provider value={{socket}} >
        {children}
    </SocketContext.Provider>
}