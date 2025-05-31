import React from 'react';
import './GameArea.css';

const GameArea = ({
  board,
  makeMove,
  turn,
  symbol,
  winner,
  messages,
  chatInput,
  setChatInput,
  sendMessage,
  messagesEndRef,
  restartGame,
}) => {
  const renderCell = (index) => {
    const cellValue = board[index];
    const cellClass = cellValue === 'X' ? 'symbol-x' : cellValue === 'O' ? 'symbol-o' : '';

    return (
      <button
        key={index}
        onClick={() => makeMove(index)}
        className={`game-cell ${cellClass}`}
        disabled={!!cellValue || !!winner || turn !== symbol}
      >
        {cellValue}
      </button>
    );
  };

  return (
    <>

      <div id="GameArea">
        {/* Game Board */}
        <div id="board">

          <div className="game-board">
            {board.map((_, idx) => renderCell(idx))}
          </div>

          {/* Restart Button */}
          {winner && (
            <div className="restart-container">
              <button onClick={restartGame} className="restart-button">
                Restart Game
              </button>
            </div>
          )}
        </div>

        {/* Chat Box */}
        <div className="chat-box">
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className="chat-message">
                <b className="msg_symbol">
                  {msg.username} ({msg.symbol}):
                </b>{' '}
                {msg.message}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-container">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
              placeholder="Type message..."
              className="chat-input"
            />
            <button onClick={sendMessage} className="chat-send-button">
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameArea;
