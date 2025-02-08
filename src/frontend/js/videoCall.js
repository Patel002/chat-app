const socket = io('https://chat-app-4dp7.onrender.com', {
    transports: ['websocket'],  
    auth: { token: localStorage.getItem('token') }
});

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const endCallButton = document.getElementById('endCallButton');
const muteButton = document.getElementById('muteButton');
const videoToggleButton = document.getElementById('videoToggleButton');
const switchCameraButton = document.getElementById('switchCameraButton');
const acceptCallButton = document.getElementById('acceptCallButton');

endCallButton.addEventListener('click', () => endVoiceCall());
startCallButton.addEventListener('click', startCall)
 
let localStream;
let remoteStream = new MediaStream();

let localTracks = {
    videoTrack: null,
    audioTrack: null
};

let remoteUsers = {};
let isMuted = true;
let isVideoEnabled = true;
let callInProgress = false;

const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
const senderId = payload.id;
console.log('senderId:', senderId);

const urlParams = new URLSearchParams(window.location.search);
let receiverId = urlParams.get('userId');


const AGORA_APP_ID = '4776f47a8a3e42658542f936e2b2c1a2';   
const AGORA_TOKEN = null;
const AGORA_CHANNEL = `${Math.min(senderId, receiverId)}_${Math.max(senderId, receiverId)}`;

const agoraClient = AgoraRTC.createClient({
    mode: 'rtc',
    codec: 'vp8'
});
async function startCall() {
    if (callInProgress) return;

    try {
        const [audioTrack, videoTrack] = await Promise.all([
            AgoraRTC.createMicrophoneAudioTrack({
                encoderConfig: {
                    codec: 'aac',
                    bitrate: 400,
                    sampleRate: 16000,
                    channels: 1,
                    AEC: true,
                    ANS: true,
                    AGC: true
                }
            }),

            AgoraRTC.createCameraVideoTrack({
                encoderConfig: {
                    resolution: '1280x720',
                    frameRate: 15,
                    bitrateMin: 1000,
                    bitrateMax: 1500,
                },
               facingMode: 'user',
               facingMode: 'environment'
            })
        ]);

        localTracks.videoTrack = videoTrack;
        localTracks.audioTrack = audioTrack;

        videoTrack.play('localVideo');
       
        await agoraClient.join(AGORA_APP_ID, AGORA_CHANNEL, AGORA_TOKEN || null, senderId);
        await agoraClient.publish([audioTrack, videoTrack]);
        audioTrack.setEnabled(false);
        isMuted = false;

        callInProgress = true;

        if (receiverId) {
            await subscribeToUser({ uid: receiverId }, 'video');
            await subscribeToUser({ uid: receiverId }, 'audio');
        }
      
        agoraClient.on('user-published', async (user, mediaType) => {
            if (user.uid == receiverId) {
                console.log(`User published: ${user.uid}`);
                await subscribeToUser(user, mediaType);
            }
        });
// const existingUsers = await agoraClient.remoteUsers;
        // existingUsers.forEach(async (user) => {
        //     console.log(`Subscribing to existing user: ${user.uid}`);
        //     await subscribeToUser(user, 'video');
        //     await subscribeToUser(user, 'audio');
        // });
        
        const existingUsers = agoraClient.remoteUsers;

        for (const user of existingUsers) {
            if (user.uid == receiverId) {
                console.log(`Subscribing to existing user: ${user.uid}`);
                await subscribeToUser(user, 'video');
                await subscribeToUser(user, 'audio');
            } else {
                console.log(`Skipping existing user: ${user.uid}, not the receiverId.`);
            }
        }

    } catch (error) {
        console.error('Error starting call:', error);
    }
}

socket.emit('callUser', { to: receiverId, from: senderId });

async function subscribeToUser(user, mediaType) {
    try {
        await agoraClient.subscribe(user, mediaType);
        console.log(`Subscribed to ${user.uid}`);

        if (mediaType === 'video') {
            const remoteVideoTrack = user.videoTrack;
            if (remoteVideoTrack) {
                remoteVideoTrack.play('remoteVideo');
            } else {
                console.warn(`No video track for user ${user.uid}`);
            }
        }

        if (mediaType === 'audio') {
            const remoteAudioTrack = user.audioTrack;
            remoteAudioTrack.play();
        }
    } catch (error) {
        console.error(`Failed to subscribe to user ${user.uid}:`, error);
    }
}

let currentCameraDeviceId = null;
async function switchCamera(){
    if (!localTracks.videoTrack) {
        console.error("Video track not available");
        return;
    }

    try {
        const devices = await AgoraRTC.getDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        if (videoDevices.length < 2) {
            console.warn("No second camera found.");
            return;
        }

        if (!currentCameraDeviceId) {
            currentCameraDeviceId = videoDevices[0].deviceId;
        }
        const nextDevice = videoDevices.find(device => device.deviceId !== currentCameraDeviceId) || videoDevices[0];

        if (!nextDevice) {
            console.warn("No alternative camera found.");
            return;
        }

        console.log(`Switching to camera: ${nextDevice.label}`);
        // await localTracks.videoTrack.setDevice(nextDevice.deviceId);

        // currentCameraDeviceId = nextDevice.deviceId;
        // socket.emit('cameraSwitched', { from: senderId, to: receiverId });

        await localTracks.videoTrack.stop();
        localTracks.videoTrack.close();

        localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack({
            cameraId: nextDevice.deviceId
        });

        currentCameraDeviceId = nextDevice.deviceId;

        localTracks.videoTrack.play('localVideo');

        await agoraClient.unpublish([localTracks.videoTrack]);
        await agoraClient.publish([localTracks.videoTrack]);

        console.log(`Switched camera to ${nextDevice.label}`);


    } catch (error) {
        console.error('Error switching camera:', error);
    }
}
switchCameraButton.addEventListener('click', switchCamera);

socket.on('cameraSwitched', async ({ data }) => {
    const { from } = data;
    const messageDiv = document.createElement('div');
    messageDiv.textContent = `${from} switched camera`;
    document.body.appendChild(messageDiv);
})

// let callTimeOut; 
// let ringtone; 

// if (Notification.permission === "default") {
//     Notification.requestPermission().then(permission => {
//         console.log("Notification permission:", permission);
//     });
// }

// acceptCallButton.style.display = 'none';
// acceptCallButton.addEventListener('click', () => {
//     if (ringtone) {
//         ringtone.pause();
//         ringtone.currentTime = 0;
//     }
//     clearTimeout(callTimeOut);
//     startCall();
// });

// from = senderId;
// to = receiverId;

// console.log('from:', from);
// console.log('to:', to);

// socket.on('callStarted', ({ from }) => {
//     console.log(`Call started from ${from}`);
    

//     if (Notification.permission === 'granted') {
//         try {
//             const notification = new Notification('Incoming video call', {
//                 body: `User ${from} is calling you`,
//                 icon: '../public/bg.jpg'
//             });
//             console.log(notification, "this is notification");
//         } catch (error) {
//             console.error("Notification failed:", error);
//         }
//     } else {
//         alert(`Incoming call from User ${from}`); // Fallback alert
//     }

//     ringtone = new Audio('../public/ringtone.mp3');
//     ringtone.loop = true;
//     ringtone.play().catch(error => console.error("Error playing ringtone:", error));

//     console.log('Ringtone playing',ringtone.paly());

//     callTimeOut = setTimeout(() => {
//         ringtone.pause();
//         ringtone.currentTime = 0;

//         socket.emit('callDeclined', { to: from });
//         alert('Call Declined');
//     }, 10000);

//     acceptCallButton.style.display = 'block';
// });
function toggleMute() {

    if (!localTracks.audioTrack) {
        console.error("Audio track not available");
        return;
    }
       
    if (isMuted) {
        localTracks.audioTrack.setEnabled(false);
        document.getElementById('muteButton').innerHTML = '<i class="fas fa-microphone-slash"></i>';
        isMuted = false;
    } else {
        localTracks.audioTrack.setEnabled(true);
        document.getElementById('muteButton').innerHTML = '<i class="fas fa-microphone"></i>';
        isMuted = true;
    }
} 

let isVideoOn = true;
function toggleVideo() {
    if (!localTracks.videoTrack) {
        console.error("Video track is not initialized.");
        return;
    }

    if (isVideoOn) {
        localTracks.videoTrack.setEnabled(false)
            .then(() => {
                document.getElementById('videoToggleButton').innerHTML = '<i class="fas fa-video-slash"></i>';
                isVideoOn = false;
                console.log("Video disabled.");
            })
            .catch(error => console.error("Failed to disable video:", error));
    } else {
        localTracks.videoTrack.setEnabled(true)
            .then(() => {
                document.getElementById('videoToggleButton').innerHTML = '<i class="fas fa-video"></i>';
                isVideoOn = true;
                console.log("Video enabled.");
            })
            .catch(error => console.error("Failed to enable video:", error));
    }
}

async function endVoiceCall(redirectToChat = true) {
    if (!callInProgress) return;

    try {
        if (localTracks.audioTrack) {
            localTracks.audioTrack.stop();
            localTracks.audioTrack.close();
            localTracks.audioTrack = null;
        }

        if (callInProgress && agoraClient) {
            await agoraClient.leave();
            callInProgress = false;
            console.log("Left Agora channel");
        }

        if (socket) {
            socket.emit('endCall', { to: receiverId });
        }
        console.log("Call ended");

        if (redirectToChat) {
            sessionStorage.setItem('callEnded', true); 
            window.location.href = 'chat.html';
        }

    } catch (error) {
        console.error('Error ending the call:', error);
    }
}
endCallButton.addEventListener('click', () => endVoiceCall());

socket.on('endCall', () => {
    console.log('Call ended by the other user');
    endVoiceCall(); 
});

window.onpopstate = () => {
    if (!callInProgress) {
        window.location.href = 'chat.html';
    }
};

window.addEventListener('beforeunload', () => {
    endVoiceCall(false); 
});

if (sessionStorage.getItem('callEnded')) {
    sessionStorage.removeItem('callEnded');
    window.location.href = 'chat.html';
}
