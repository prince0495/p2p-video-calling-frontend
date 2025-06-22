import { createContext, useCallback, useState, type ReactNode } from "react";

type PeerType = {
    pc: RTCPeerConnection;
    reset: () => void;
}

const stunServers = [
  'stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
  'stun:stun2.l.google.com:19302',
  'stun:stun3.l.google.com:19302',
  'stun:stun4.l.google.com:19302',
  'stun:stun.ekiga.net',
  'stun:stun.ideasip.com',
  'stun:stun.rixtelecom.se',
  'stun:stun.schlund.de',
  'stun:stun.stunprotocol.org:3478',
  'stun:stun.voiparound.com',
  'stun:stun.voipbuster.com',
  'stun:stun.voipstunt.com',
  'stun:stun.voxgratia.org',
  'stun:23.21.150.121:3478',
  'stun:iphone-stun.strato-iphone.de:3478',
  'stun:numb.viagenie.ca:3478',
  'stun:s1.taraba.net:3478',
  'stun:s2.taraba.net:3478',
  'stun:stun.12connect.com:3478',
  'stun:stun.12voip.com:3478',
  'stun:stun.1und1.de:3478',
];

const config: RTCConfiguration = {
  iceServers: stunServers.map(url => ({ urls: url }))
};

export const PeerContext = createContext<PeerType | null>(null);

export const PeerProvider = ({children}: {children: ReactNode}) => {
    const [pc, setPc] = useState(() => new RTCPeerConnection(config));
    
    const reset = useCallback(() => {
        try {
            pc.close();
        } catch (error) {
            
        }
        const newPc = new RTCPeerConnection(config);
        setPc(newPc);
    }, [pc])

    return <PeerContext.Provider value={{pc, reset}}>
        {children}
    </PeerContext.Provider>
}