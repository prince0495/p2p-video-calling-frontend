import { useContext, useEffect, useRef, useState } from 'react';
import { PeerContext } from '../context/Peer';
import { SocketContext } from '../context/Socket';
import { useParams, useNavigate } from 'react-router-dom';
import { VideoOff, Video, Mic, MicOff, PhoneOff } from 'lucide-react';

const Room = () => {
  const { id } = useParams();
  const roomName = id as string;

  const peerConnection = useContext(PeerContext);
  const socketConnection = useContext(SocketContext);
  const navigate = useNavigate();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [remoteConnected, setRemoteConnected] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  if (!socketConnection || !peerConnection) {
    alert('Please refresh the page...');
    return null;
  }

  const socket = socketConnection.socket;
  const pc = peerConnection.pc;

  useEffect(() => {
    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('createOffer', { roomName, sdp: offer });
    };

    pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        socket.emit('iceCandidateExchange', {
          roomName,
          candidate: event.candidate,
        });
      }
    };

    const setupMedia = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    };

    pc.ontrack = (event: RTCTrackEvent) => {
      const remoteMedia = new MediaStream();
      event.streams[0].getTracks().forEach((track) => {
        remoteMedia.addTrack(track);
      });

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteMedia;
        setRemoteConnected(true);
      }
    };

    setupMedia();

    socket.on('newUserJoined', () => console.log('new user joined'));

    socket.on('createOffer', async ({ sdp }) => {
      await pc.setRemoteDescription(sdp);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('createAnswer', { roomName, sdp: answer });
    });

    socket.on('createAnswer', async ({ sdp }) => {
      await pc.setRemoteDescription(sdp);
    });

    socket.on('iceCandidateExchange', async ({ candidate }) => {
      await pc.addIceCandidate(candidate);
    });

    socket.on('userLeft', () => {
      setRemoteConnected(false);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const toggleVideo = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !videoEnabled;
    });
    setVideoEnabled((prev) => !prev);
  };

  const toggleAudio = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !audioEnabled;
    });
    setAudioEnabled((prev) => !prev);
  };

  const endCall = () => {
    localStream?.getTracks().forEach((track) => track.stop());
    socket.emit('leaveRoom', roomName);
    navigate('/');
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* Remote Video */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className={`${
          remoteConnected ? 'block' : 'hidden'
        } w-full h-full object-contain`}
      />

      {/* Local Video */}
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        className={`${
          remoteConnected
            ? 'absolute top-4 left-4 w-32 h-24 sm:w-40 sm:h-32 object-cover border-2 border-white rounded-lg shadow-lg z-10'
            : 'w-full h-full object-contain'
        }`}
      />

      {/* Connection Status */}
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-white text-xs sm:text-sm font-light opacity-80 z-20">
        {remoteConnected ? 'Connected' : 'Waiting for other user to join...'}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 z-30 px-4 flex-wrap justify-center w-full">
        <button
          onClick={toggleVideo}
          className="bg-white bg-opacity-10 hover:bg-opacity-30 text-white p-3 rounded-full shadow-lg transition-all"
        >
          {videoEnabled ? <Video className="w-6 h-6 text-blue-500" /> : <VideoOff className="w-6 h-6 text-red-500" />}
        </button>

        <button
          onClick={toggleAudio}
          className="bg-white bg-opacity-10 hover:bg-opacity-30 text-white p-3 rounded-full shadow-lg transition-all"
        >
          {audioEnabled ? <Mic className="w-6 h-6 text-blue-500" /> : <MicOff className="w-6 h-6 text-red-500" />}
        </button>

        <button
          onClick={endCall}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Room;
