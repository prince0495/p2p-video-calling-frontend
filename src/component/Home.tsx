import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/Socket';
import { PeerContext } from '../context/Peer';

const Home = () => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const roomNameRef = useRef('');
  
  const socketConnection = useContext(SocketContext)
  const peerConnection = useContext(PeerContext)
  
  if(socketConnection === null) {
    alert('refresh again...')
    return;
  }
  if(peerConnection === null) {
    alert('please wait and refresh again...')
    return;
  }
  const socket = socketConnection.socket;
  const pc = peerConnection.pc;
  const reset = peerConnection.reset;
  console.log(socket);
  console.log(pc);
  

  useEffect(() => {
    socket.on('roomJoined', () => {
      navigateToRoom()
    })
    socket.on('roomFull', () => {
      alert('This room is already full , try another room...')
    })
  }, [socket])
  
  function navigateToRoom() {
    navigate(`/room/${roomNameRef.current}`)
  }
  
  const handleJoin = () => {
    if(!roomName.trim()) return;  
    reset();  
    socket.emit('joinRoom', roomName)
  };

  const handleCreate = () => {
    if(!roomName.trim()) return;  
    reset();  
    socket.emit('joinRoom', roomName)
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-8 w-full max-w-md text-white animate-fade-in">
        <h2 className="text-3xl font-semibold mb-6 text-center">Join or Create a Meeting</h2>

        <input
          type="text"
          placeholder="Enter Room Name"
          value={roomName}
          onChange={(e) => {
              e.preventDefault()
            setRoomName(e.target.value)
            roomNameRef.current = e.target.value
          }}
          className="w-full p-3 rounded-lg bg-white/20 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
        />

        <div className="flex justify-between gap-4">
          <button
            onClick={handleJoin}
            className="w-1/2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition duration-200"
          >
            Join Meeting
          </button>
          <button
            onClick={handleCreate}
            className="w-1/2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-lg transition duration-200"
          >
            Create Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
