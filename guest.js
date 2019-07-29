//createConnection() => requestSignal() => setRemoteDes() => addIce() => createAnswer() => send ice and description
let remotePeerConnection, receiveChannel;
let description, ice;
let localDes, localIce=[];
let remoteVideo = document.getElementById("remote-video");
function trace(text){
    console.log((performance.now()/1000).toFixed(3)+": "+text);
}

function requestSignal(){
    ws.send(JSON.stringify({role: "guest", method: "requestDes"}));
}

function setRemoteDes(){
    remotePeerConnection.setRemoteDescription(description);
}

function addIce(){
    for(x of ice){
        if(x)remotePeerConnection.addIceCandidate(new RTCIceCandidate(x));
    }
}

function createAnswer(){
    remotePeerConnection.createAnswer((description)=>{
        remotePeerConnection.setLocalDescription(description);
        localDes = description;
        console.log("get local description");
    },()=>{});
}

function createConnection(){
    remotePeerConnection = new RTCPeerConnection({
        'iceServers': [
            {'urls': 'stun:stun.l.google.com:19302'}
        ]
    });
    trace("Created remote peer connection object");
    remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
    remotePeerConnection.ondatachannel = function(event){
        receiveChannel = event.channel;
        receiveChannel.onmessage = function(e){
            remoteMsg.value=e.data;
        }
    }
    remotePeerConnection.onaddstream = gotRemoteStream;
}

function gotRemoteStream(event){
    remoteVideo.srcObject=event.stream;
    trace("Received remote stream");
}

function gotRemoteIceCandidate(event){
    if(event.candidate){
        localIce.push(event.candidate);
    }else{
        console.log("get all ICE candidate")
    }
}