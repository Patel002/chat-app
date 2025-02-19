import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-messaging.js";

const firebaseConfig = {
    apiKey: "AIzaSyAx1R7Sr2wUQdX9jjk5q3nihSLcNHt8WYA",
    authDomain: "chat-d33bd.firebaseapp.com",
    projectId: "chat-d33bd",
    storageBucket: "chat-d33bd.firebasestorage.app",
    messagingSenderId: "812569481327",
    appId: "1:812569481327:web:59475162a18cdeb2363d9a",
    measurementId: "G-9XN6457J13"
};

    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);

    if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/firebase-messaging-sw.js") 
    .then((registration) => {
        console.log("Service Worker registered with scope:", registration.scope);
    })
    .catch((error) => {
        console.error("Service Worker registration failed:", error);
    });
}
async function requestFcmTokenPermission() {
const permission = await Notification.requestPermission();
    if(permission != "denied"){
        const fcmToken = await getToken(messaging, { vapidKey: "BAczhSZPk0Ag_VhbfZhSCOxz3N72I-zPZQAgEm1DrE9bPySUQ79A6OYOZ5FdfNL87GX_bpiNUe_g46h3lKE2S-w" })
        
        // console.log("fCM Token:", fcmToken);

        if(fcmToken){
            localStorage.setItem('fcmToken', fcmToken);
            return fcmToken;
        }else{
            console.log("Notification permission denied by user.");
        }
    }
}

onMessage(messaging, (payload) => {
console.log("[onMessage] Message received:", payload);

if (payload.data) {
    const { title, body } = payload.data;

    const notificationOptions = {
        body: body,
        icon: "/public/notify.png" ,
        sound: "/public/ringtone.mp3",
    };

    new Notification(title, notificationOptions);

    const audio = new Audio("../public/ringtone.mp3");
    audio.play();

} else {
    console.warn("No notification payload found!");
} 
});

const channel = new BroadcastChannel("fcm_notifications");

channel.addEventListener("message", (event) => {
    console.log("[BroadcastChannel] Received notification:", event.data);

    const { title, body } = event.data;

    const notificationOptions = {
        body: body,
        icon: "../public/notify.png",
    };

    new Notification(title, notificationOptions);

    const audio = new Audio("../public/ringtone.mp3");
    audio.play();
});


async function sendNotification(message, receiverId) {
    try {
        const receiversTokenResponse = await fetch(`http://localhost:7116/api/v1/fcm-token/get-fcm-token/${receiverId}`);
        const receiverTokenData = await receiversTokenResponse.json();

        console.log("Fetched Receiver's Token Data:", receiverTokenData);

        if (!receiverTokenData || !receiverTokenData.token.fcmToken) {
            console.log("Receiver's FCM Token not found. Skipping notification.");
            return;
        }

        const fcmToken = receiverTokenData.token.fcmToken;

        console.log("Message:", message);
        console.log("Receiver ID:", receiverId);
        console.log("FCM Token:", fcmToken);

        const response = await fetch('http://localhost:7116/api/v1/notification/notify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message,
                userId: receiverId,
                title: 'New Message',
                fcmToken
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to send notification: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Notification response:", data);

    } catch (error) {
        console.log('sendPushNotification Error:', error);
    }
}

export { requestFcmTokenPermission,sendNotification, messaging }