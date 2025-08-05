
import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/Socket';
import { PeerContext } from '../context/Peer';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([])

  const roomNameRef = useRef('');

  const socketConnection = useContext(SocketContext);
  const peerConnection = useContext(PeerContext);

  if (socketConnection === null || peerConnection === null) {
    alert('refresh again...');
    return null;
  }

  const socket = socketConnection.socket;
  const pc = peerConnection.pc;
  const reset = peerConnection.reset;

  type Room = {
  id: string;
  name: string;
};

type GetRoomsResponse = {
  rooms: Room[];
};

const getRooms = async () => {
  try {
    const res = await axios.get<GetRoomsResponse>(`${import.meta.env.VITE_BACKEND_URL}/room`);
    setRooms(res.data.rooms)
    
  } catch (err) {
    console.error("Failed to fetch rooms:", err);
  }
};
  useEffect(() => {
    getRooms()
    socket.on('roomJoined', () => {
      navigateToRoom();
    });
    socket.on('roomFull', () => {
      alert('This room is already full, try another room...');
    });
  }, [socket]);

  function navigateToRoom() {
    navigate(`/room/${roomNameRef.current}`);
  }

  const handleJoin = () => {
    if (!roomName.trim()) return;
    reset();
    socket.emit('joinRoom', roomName);
  };

  const handleCreate = async() => {
    if (!roomName.trim()) return;
    reset();
    socket.emit('joinRoom', roomName);
    if(!isPrivate) {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/room/create`, {
        roomName
      });
    }
  };

  const handleJoinRoom = (name: string) => {
    // Right side
    reset();
    roomNameRef.current = name
    socket.emit('joinRoom', name);
  };

  return (
  <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 py-8 gap-8">

  {/* Form Section */}
  <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-8 text-white animate-fade-in">
  
  <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
    <h2 className="text-3xl font-semibold text-center w-full sm:w-auto">Join or Create a Meeting</h2>

   
    <div className="flex items-center gap-2 ml-auto">
      <span className="text-sm font-medium">{isPrivate ? 'Private' : 'Public'}</span>
      <button
        onClick={() => setIsPrivate(!isPrivate)}
        className={`w-14 h-8 flex items-center rounded-full px-1 transition-colors duration-300 
          ${isPrivate ? 'bg-indigo-600' : 'bg-green-600'}`}
      >
        <div
          className={`h-6 w-6 rounded-full bg-white transform transition-transform duration-300
            ${isPrivate ? 'translate-x-6' : 'translate-x-0'}`}
        />
      </button>
      
      {isPrivate ? (
        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 17v.01M17 8V7a5 5 0 00-10 0v1M5 8h14v12H5V8z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 17v.01M17 8h-1V7a5 5 0 00-10 0v1H5v12h14V8z" />
        </svg>
      )}
    </div>
  </div>

  
  <input
    type="text"
    placeholder="Enter Room Name"
    value={roomName}
    onChange={(e) => {
      e.preventDefault();
      setRoomName(e.target.value);
      roomNameRef.current = e.target.value;
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


  {/* Room List Section */}
  <div className="w-full max-w-md text-white animate-fade-in bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6 flex flex-col min-h-[24rem] max-h-[80vh]">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold">Available Rooms</h3>
      <div className="text-sm flex items-center justify-center gap-2">
        <div>{rooms.length}</div>
        <div className="text-emerald-500">Active {rooms.length === 1 ? 'Room' : 'Rooms'}</div>
      </div>
    </div>

    <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3">
      {rooms.length === 0 && (
        <p className="text-white/60 italic text-sm text-center mt-12">No rooms available</p>
      )}
      {rooms.map((room, index) => (
        <div
          key={index}
          className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-lg border border-white/10 hover:bg-white/10 transition"
        >
          <span className="truncate font-medium">{room.name}</span>
          <button
            onClick={() => handleJoinRoom(room.name)}
            className="text-sm bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition"
          >
            Join
          </button>
        </div>
      ))}
    </div>
  </div>
</div>


  );
};

export default Home;
