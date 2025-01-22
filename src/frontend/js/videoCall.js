const socket = io('https://chat-app-4dp7.onrender.com', {
    auth: { token: localStorage.getItem('token') }
});

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const endCallButton = document.getElementById('endCallButton');
const muteButton = document.getElementById('muteButton');
const videoToggleButton = document.getElementById('videoToggleButton');

let localStream;
let remoteStream = new MediaStream();

let localTracks = {
    videoTrack: null,
    audioTrack: null
};

let remoteUsers = {};
let isMuted = true;
let isVideoEnabled = true
let callInProgress = false;

const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
const senderId = payload.id;
console.log('senderId:', senderId);


const urlParams = new URLSearchParams(window.location.search);
let receiverId = urlParams.get('userId');
// localStorage.setItem('userId', senderId);


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
                   channels: 2,
                    AEC: true,
                    ANS: true,
                    AGC: true
                }
            }),

            AgoraRTC.createCameraVideoTrack({
                encoderConfig: {
                    resolution: '940x540',
                    frameRate: 15,
                    bitrateMin: 400,
                    bitrateMax: 600,
                }
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

async function leaveCall() {
    try {
        if (localTracks.videoTrack) {
            localTracks.videoTrack.stop();
            localTracks.videoTrack.close(); 
        }
        if (localTracks.audioTrack) {
            localTracks.audioTrack.stop(); 
            localTracks.audioTrack.close(); 
        }
        
        localTracks = { videoTrack: null, audioTrack: null }; 

        await agoraClient.leave(); 

        console.log('Left the call successfully.');
    } catch (error) {
        console.error('Error leaving call:', error);
    }
}

function toggleMute() {
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
        localTracks.videoTrack.setEnabled(true)
            .then(() => {
                document.getElementById('videoToggleButton').innerHTML = '<i class="fas fa-video"></i>';
                isVideoOn = false;
                console.log("Video enabled.");
            })
            .catch(error => console.error("Failed to disable video:", error));
    } else {
        localTracks.videoTrack.setEnabled(false)
            .then(() => {
                document.getElementById('videoToggleButton').innerHTML = '<i class="fas fa-video-slash"></i>';
                isVideoOn = true;
                console.log("Video disabled.");
            })
            .catch(error => console.error("Failed to enable video:", error));
    }
}

async function endCall() {
   try {

    if (localTracks.audioTrack) {
        localTracks.audioTrack.stop();
        localTracks.audioTrack.close();
        localTracks.audioTrack = null;
    }

    if (callInProgress) {
        await agoraClient.leave();
        callInProgress = false;
        console.log("Left Agora channel");
    }

    if (socket) {
        socket.emit('endCall', { to: receiverId });
    }

    window.location.href = 'chat.html';

   } catch (error) {
        console.error('Error ending call:', error);
   }
}

    socket.on('endCall', () => {
        if (localTracks.audioTrack) {
            localTracks.audioTrack.stop();
            localTracks.audioTrack.close();
            localTracks.audioTrack = null;
        }

        if (callInProgress) {
            agoraClient.leave();
            callInProgress = false;
        }

        window.location.href = 'chat.html';
    })

    endCallButton.addEventListener('click', endCall);

    window.onbeforeunload = () => {
        endCall(); 
    };

startCall()