import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './component/Home'
import Room from './component/Room'
import { SocketProvider } from './context/Socket'
import { PeerProvider } from './context/Peer'


function App() {

  return (
    <>
      <SocketProvider>
        <PeerProvider>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Home/>} />
              <Route path='/room/:id' element={<Room/>} />
            </Routes>
          </BrowserRouter>
        </PeerProvider>
      </SocketProvider>
    </>
  )
}

export default App
