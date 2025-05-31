import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Lobby from '../components/Lobby';
import GameArea from '../components/GameArea';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleLeft } from '@fortawesome/free-solid-svg-icons';
import './GamePage.css';

const socket = io(
  process.env.NODE_ENV === 'production'
    ? undefined // Uses the same domain in production (Render)
    : 'http://localhost:4000' // Dev mode uses local server
);

function GamePage() {
  const [roomId, setRoomId] = useState('');
  const [symbol, setSymbol] = useState('');
  const [username, setUsername] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [joinRoomInput, setJoinRoomInput] = useState('');
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState('X');
  const [winner, setWinner] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isMusicMuted, setIsMusicMuted] = useState(false);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const backgroundMusic = useRef(null);
  const moveSound = useRef(null);
  const winSound = useRef(null);
  const drawSound = useRef(null);
  const clickSound = useRef(null);
  const lossSound = useRef(null);

  useEffect(() => {
    backgroundMusic.current = new Audio('/sounds/background-music.mp3');
    backgroundMusic.current.loop = true;
    backgroundMusic.current.volume = 0.3;
    backgroundMusic.current.muted = isMusicMuted;

    moveSound.current = new Audio('/sounds/move.mp3');
    winSound.current = new Audio('/sounds/win.mp3');
    drawSound.current = new Audio('/sounds/draw.mp3');
    clickSound.current = new Audio('/sounds/click.mp3');
    lossSound.current = new Audio('/sounds/loss.mp3');

    const startMusic = () => {
      if (backgroundMusic.current && !isMusicMuted) {
        backgroundMusic.current.play().catch(() => {});
      }
      window.removeEventListener('click', startMusic);
    };

    window.addEventListener('click', startMusic);

    return () => {
      window.removeEventListener('click', startMusic);
      backgroundMusic.current?.pause();
    };
  }, [isMusicMuted]);

  const toggleMusicMute = () => {
    clickSound.current?.play().catch(() => {});
    if (!backgroundMusic.current) return;
    const newMuted = !isMusicMuted;
    backgroundMusic.current.muted = newMuted;
    setIsMusicMuted(newMuted);
  };

  useEffect(() => {
    socket.on('roomCreated', ({ roomId, symbol }) => {
      setRoomId(roomId);
      setSymbol(symbol);
      resetGame();
    });

    socket.on('roomJoined', ({ roomId, symbol }) => {
      setRoomId(roomId);
      setSymbol(symbol);
      resetGame();
    });

    socket.on('gameUpdate', ({ board, turn, winner }) => {
      setBoard(board);
      setTurn(turn);
      moveSound.current?.play().catch(() => {});

      if (winner) {
        setWinner(winner);
        if (winner === 'draw') {
          drawSound.current?.play().catch(() => {});
        } else if (winner !== symbol) {
          lossSound.current?.play().catch(() => {});
        } else {
          winSound.current?.play().catch(() => {});
        }
      } else {
        setWinner(null);
      }
    });

    socket.on('receiveMessage', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socket.on('error', (msg) => alert(msg));

    return () => {
      socket.off('roomCreated');
      socket.off('roomJoined');
      socket.off('gameUpdate');
      socket.off('receiveMessage');
      socket.off('error');
    };
  }, [symbol]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setWinner(null);
    setChatMessages([]);
  };

  const restartGame = () => {
    if (roomId) {
      socket.emit('restartGame', { roomId });
    }
  };

  const createRoom = () => {
    clickSound.current?.play().catch(() => {});
    if (!nameInput.trim()) return alert('Enter your username');
    setUsername(nameInput.trim());
    socket.emit('createRoom', { username: nameInput.trim() });
  };

  const joinRoom = () => {
    clickSound.current?.play().catch(() => {});
    if (!nameInput.trim() || !joinRoomInput.trim()) {
      return alert('Enter username and room ID');
    }
    setUsername(nameInput.trim());
    socket.emit('joinRoom', {
      roomId: joinRoomInput.trim().toUpperCase(),
      username: nameInput.trim(),
    });
  };

  const makeMove = (index) => {
    if (!winner && board[index] === null && turn === symbol) {
      socket.emit('makeMove', { roomId, index, symbol });
    }
  };

  const sendMessage = () => {
    if (chatInput.trim() && roomId && symbol && username) {
      socket.emit('sendMessage', {
        roomId,
        message: chatInput.trim(),
        symbol,
        username,
      });
      setChatInput('');
    }
  };

  const handleBack = () => {
    clickSound.current?.play().catch(() => {});
    socket.disconnect();
    backgroundMusic.current?.pause();
    navigate('/');
  };

  return (
    <div className="gamepage-container">
      <button onClick={handleBack} className="gamepage-button1 back-button">
        <FontAwesomeIcon icon={faCircleLeft}/>
      </button>

      {roomId && (
        <button
          onClick={toggleMusicMute}
          className="gamepage-button2 music-toggle-button"
          title={isMusicMuted ? 'Unmute music' : 'Mute music'}
        >
          {isMusicMuted ? '🔇' : '🔊'}
        </button>
      )}

      {!roomId ? (
        <Lobby id='lobby'
          nameInput={nameInput}
          setNameInput={setNameInput}
          joinRoomInput={joinRoomInput}
          setJoinRoomInput={setJoinRoomInput}
          createRoom={createRoom}
          joinRoom={joinRoom}
        />
      ) : (
        <>
          <h3 className='heading'>
            <span className='Game_heading'>
            You are: {symbol} ({username}) |{' '}
            {winner
              ? winner === 'draw'
              ? "It's a draw!"
              : `Winner: ${winner}`
              : `Turn: ${turn}`}
              </span>
              Room: {roomId}
          </h3>

          <GameArea
            board={board}
            makeMove={makeMove}
            turn={turn}
            symbol={symbol}
            winner={winner}
            messages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            sendMessage={sendMessage}
            messagesEndRef={messagesEndRef}
            restartGame={restartGame}
          />
        </>
      )}
    </div>
  );
}

export default GamePage;
