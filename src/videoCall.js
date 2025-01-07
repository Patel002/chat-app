
const AGORA_APP_ID = '4776f47a8a3e42658542f936e2b2c1a2';  
const AGORA_CHANNEL = 'test_channel';   
const AGORA_TOKEN = null;

const socket = io('http://localhost:7116', {
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

const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
const senderId = payload.id;
console.log('senderId:', senderId);

const urlParams = new URLSearchParams(window.location.search);
let receiverId = urlParams.get('userId');
localStorage.setItem('userId', senderId);
let callInProgress = false;

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
                    resolution: '640x360',
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

      
        agoraClient.on('user-published', async (user, mediaType) => {
            console.log(`User published: ${user.uid}`);
            await subscribeToUser(user, mediaType);
        });

    
        const existingUsers = await agoraClient.remoteUsers;
        existingUsers.forEach(async (user) => {
            console.log(`Subscribing to existing user: ${user.uid}`);
            await subscribeToUser(user, 'video');
            await subscribeToUser(user, 'audio');
        });

    } catch (error) {
        console.error('Error starting call:', error);
    }
}

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
    if (!callInProgress) return;

    try {
        await agoraClient.unpublish(Object.values(localTracks));
        localTracks.videoTrack?.close();
        localTracks.audioTrack?.close();
        localTracks = { videoTrack: null, audioTrack: null };

        await agoraClient.leave();
        callInProgress = false;

        console.log('Left the call.');
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

function endCall() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    socket.emit('endCall', { to: receiverId });
    window.stop();
    window.location.href = 'chat.html';
}

startCall()