import React from 'react';
import './Lobby.css';

const Lobby = ({ nameInput, setNameInput, joinRoomInput, setJoinRoomInput, createRoom, joinRoom }) => (
  <>
    <div id='Lobby_container'>

      <h2 className='head2'>
        <span className='sub_head2'>M</span>ultiplayer 
        <span className='sub_head2'>T</span>ic
        <span className='sub_head2'>T</span>ac
        <span className='sub_head2'>T</span>oe
      </h2>

      <div className="input_container">
        <p className='lobby_para'>Enter Your Name</p>
        <input
          className='lobby_inputbox'
          type="text"
          placeholder="Your Name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />
      </div>


      <div className="input_container">
        <p className='lobby_para'>Enter Room ID</p>
        <input
          className='lobby_inputbox'
          type="text"
          placeholder="Enter Room ID to join"
          value={joinRoomInput}
          onChange={(e) => setJoinRoomInput(e.target.value.toUpperCase())}
        />
      </div>

      <div id="button_container">
        <button className='lobby_button' onClick={createRoom} >
          Create Room
        </button>
        <button className='lobby_button' onClick={joinRoom} >
          Join Room
        </button>
      </div>
    </div>
  </>
);

export default Lobby;
