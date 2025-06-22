export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  createOffer: ({roomName, sdp}: {roomName: string, sdp: any}) => void;
  createAnswer: ({roomName, sdp}: {roomName: string, sdp: any}) => void;
  
  joinRoom: (roomName: string) => void;
  iceCandidateExchange: ({roomName, candidate}: {roomName: string, candidate: RTCIceCandidate}) => void;
  leaveRoom: (roomName: string) => void;
  
}

export interface ClientToServerEvents {
  newUserJoined: () => void;
  roomFull: () => void;
  roomJoined: () => void;
  hello: () => void;
  createOffer: ({roomName, sdp}: {roomName: string, sdp: any}) => void;
  createAnswer: ({roomName, sdp}: {roomName: string, sdp: any}) => void;
  iceCandidateExchange: ({roomName, candidate}: {roomName: string, candidate: RTCIceCandidate}) => void;
  userLeft: () => void;
}
