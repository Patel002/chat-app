const localAudio = document.getElementById('localAudio');
const remoteAudio = document.getElementById('remoteAudio');
const endCallButton = document.getElementById('endCallButton');
const muteButton = document.getElementById('muteButton');

let localTracks = {
    audioTrack: null
};
let remoteUsers = {};
let callInProgress = false;
let isMuted = true;

const AGORA_APP_ID = 'be1a0d343fb54bac8cf7adc8615d8648';
const AGORA_CHANNEL = 'testing_channel';
const AGORA_TOKEN = null;

const agoraClient = AgoraRTC.createClient({
    mode: 'rtc',
    codec: 'vp8'
});

async function startVoiceCall() {
    if (callInProgress) return;

    try {
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
            encoderConfig: {
                codec: 'aac',
                bitrate: 600, 
                sampleRate: 48000,
                channels: 2,
                AEC: true,    
                ANS: true,   
                AGC: true    
            }
        });

        localTracks.audioTrack = audioTrack;

        await agoraClient.join(AGORA_APP_ID, AGORA_CHANNEL, AGORA_TOKEN);
        await agoraClient.publish(audioTrack);
        if (audioTrack) {
            audioTrack.setEnabled(false); 
        }
        isMuted = false;

        console.log("Voice call started, audio track published.");

        callInProgress = true;

        agoraClient.on('user-published', async (user, mediaType) => {
            console.log(`User published: ${user.uid}`);
            if (mediaType === 'audio') {
                await subscribeToUser(user);
            }
        });

        agoraClient.on('user-unpublished', (user) => {
            console.log(`User unpublished: ${user.uid}`);
            if (remoteUsers[user.uid]) {
                delete remoteUsers[user.uid];
            }
        });

    } catch (error) {
        console.error('Error starting voice call:', error);
    }
}
async function subscribeToUser(user) {
    try {
        await agoraClient.subscribe(user, 'audio');
        console.log(`Subscribed to user: ${user.uid}`);

        const remoteAudioTrack = user.audioTrack;
        if (remoteAudioTrack) {
            remoteAudioTrack.play();
            console.log(`Playing remote audio for user: ${user.uid}`);
            remoteUsers[user.uid] = user;
        }
    } catch (error) {
        console.error(`Failed to subscribe to user ${user.uid}:`, error);
    }
}

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

async function endVoiceCall() {
    if (!callInProgress) return;

    try {
        await agoraClient.unpublish(localTracks.audioTrack);
        localTracks.audioTrack?.stop();
        localTracks.audioTrack?.close();
        localTracks = { audioTrack: null };

        await agoraClient.leave();
        callInProgress = false;

        console.log("Voice call ended.");
        socket.emit('endCall', { to: receiverId });
        window.location.href = 'chat.html';
    } catch (error) {
        console.error('Error ending voice call:', error);
    }
}

muteButton.addEventListener('click', toggleMute);
endCallButton.addEventListener('click', endVoiceCall);

startVoiceCall();