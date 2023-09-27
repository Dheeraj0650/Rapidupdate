import React, {useEffect, useRef, useState} from "react";
import { useNavigate, redirect} from 'react-router-dom';
import { useSelector, useDispatch} from "react-redux";
import { io } from 'socket.io-client';
import axios from 'axios';
import ReactDOM from 'react-dom';
import Button from '@mui/material/Button';
import ConnectionList from './ConnectionList';

const socket = io('http://localhost:3001');

function Textarea(){

    const [openNewModal, setNewOpenModal] = useState(false);

    const userField = useRef();
    const navigate = useNavigate();
    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    const username = useSelector(state => state.auth.username);
    const [room, setRoom] = useState(""); 

    const Backdrop = (props) => {
        return <div className="backdrop"/>;
    };
    
    const ModalOverlay = (props) => {
        return (
            <div className='modal-card'>
                <header className="header">
                    <h2>Connect</h2>
                </header>
                <div className="content">
                    <ConnectionList username={username}/>
                </div>
                <footer className="actions">
                    <Button onClick={() => {setNewOpenModal(false)}}>Close</Button>
                </footer>
            </div>
        );
    };

    console.log(isLoggedIn);

    useEffect(() => {
        if(!isLoggedIn){
            navigate('/login');
        }

        socket.on("change_text_global",function(data){
            document.getElementsByClassName('textarea is-large')[0].value = data;
        });

        socket.on("join_room_global",function(data){
            if(data.username.includes(username)){
                socket.emit("join_room", data.value);
            }
        });

        axios.post('http://localhost:3001/realtime-text', {type:'pull' , username: username} ,{
            withCredentials: true,
            credentials: 'include'
        }).then(function(response){
            console.log(response);
            document.getElementsByClassName('textarea is-large')[0].value = response.data.realtimetext;
        }).catch(function(error){
        
        })

    }, []);

    function onTextAreaChange(event){
        socket.emit("change_text", {realtimetext:event.target.value, room:room});
        axios.post('http://localhost:3001/realtime-text', {type:'push' , username: username, realtimetext: event.target.value, room:room} ,{
            withCredentials: true,
            credentials: 'include'
        }).then(function(response){

        }).catch(function(error){
        
        })
    }

    function handleConnect(){
        setNewOpenModal(true);
    }

    return (
        <div class="control" style={{display:"flex", flexDirection:"column", justifyContent:"center", alignContent:"center", alignItems:"center", gap:"1rem", marginTop:"1rem"}}>
            <div className="container-fluid" style={{display:"flex", flexDirection:"row", justifyContent:"center", alignContent:"center", alignItems:"center", gap:"1rem"}}>
                {/* <TextField
                    label="Join a room"
                    id="filled-size-normal"
                    defaultValue=""
                    variant="filled"
                    ref = {userField}
                /> */}

                {openNewModal && ReactDOM.createPortal(
                    <Backdrop/>,
                    document.getElementById('backdrop-root')
                )}
                {openNewModal && ReactDOM.createPortal(
                    <ModalOverlay
                    name = "Connect to a user"
                    />,
                    document.getElementById('overlay-root')
                )}
                <Button variant="contained" onClick={handleConnect}>Connect</Button>
            </div>
            {isLoggedIn && <textarea class="textarea is-large" placeholder="Real Time Update" onChange={onTextAreaChange}></textarea>}
        </div>
    )
}

export default Textarea;