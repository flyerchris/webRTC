//pipeline: getMedia() => newConnectionToGuest() => signal() => send description and iceCandidate => setRemoteDescription() => addRemoteIceCandidate()

let localStream; // stream from self webcam
let peerConnection = [];
let pi = -1;
const iceServer = {
    'iceServers': [
        {'urls': 'stun:stun.l.google.com:19302'}
    ]
};
function trace(text){
    console.log((performance.now()/1000).toFixed(3)+": "+text);
}

function getMedia(){
    trace("Requesting local stream");
    getUserMedia({audio:true, video:true},gotStream,createErrorHandler("getUserMedia error"));
}

function newConnectionToGuest(){
    newConnection = new RTCPeerConnection(iceServer)
    peerConnection.push(newConnection);
    pi++;
    sendChannel = newConnection.createDataChannel('sendDataChannel',null);
    newConnection.onicecandidate = (event)=>{
        if(!newConnection.ice){
            newConnection.ice = [];   
        }
        if(event.candidate){
            newConnection.ice.push(event.candidate);
        }else{
            console.log("get all local ice candidate");
        }
    };
    newConnection.addStream(localStream);
}

function gotStream(stream){
    trace("Requesting local stream");
    localStream = stream;
    if(localStream.getVideoTracks().length > 0)trace('Using video device: '+localStream.getVideoTracks()[0].label);
    if(localStream.getAudioTracks().length > 0)trace('Using audio device: '+localStream.getAudioTracks()[0].label);
}

function signal(connection){
    connection.createOffer((description)=>{
        connection.setLocalDescription(description);
        console.log("get local description");
    }, createErrorHandler("signal error"));
    console.log(peerConnection[0]);
}

function createErrorHandler(msg){
    return function (error){
        trace(`${msg}: ${error}`);
    }
}

function setRemoteDescription(connection, description){
    connection.setRemoteDescription(description);
}

function addRemoteIceCandidate(connection, candidates){
    for(c of candidates){
        connection.addIceCandidate(new RTCIceCandidate(c));
    }
}