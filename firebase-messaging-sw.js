importScripts("https://www.gstatic.com/firebasejs/11.2.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.2.0/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyAx1R7Sr2wUQdX9jjk5q3nihSLcNHt8WYA",
    authDomain: "chat-d33bd.firebaseapp.com",
    projectId: "chat-d33bd",
    storageBucket: "chat-d33bd.firebasestorage.app",
    messagingSenderId: "812569481327",
    appId: "1:812569481327:web:59475162a18cdeb2363d9a",
    measurementId: "G-9XN6457J13"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// messaging.onBackgroundMessage((payload) => {
//     console.log("[firebase-sw] Background Message received:", JSON.stringify(payload, null, 2));

//     if(!payload.data) {
//         console.warn("No notification payload received.");
//         return;
//     }

//     const { title, body } = payload.data;
//     const notificationOptions = {
//         body: body,
//         title: title,
//     };
//     const channel = new BroadcastChannel("fcm_notifications");
//     channel.postMessage({
//         notification: notificationOptions
//     });
// });

// self.addEventListener("notificationclick", (event) => {
//     event.notification.close();
//     event.waitUntil(clients.openWindow("/chat"));
// });


messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-sw] Background Message received:", JSON.stringify(payload, null, 2));

    if (!payload.data) {
        console.warn("No notification payload received.");
        return;
    }

    const { title, body } = payload.data;
    const notificationOptions = {
        body: body,
        icon: "/src/frontend/public/notify.png", 
        sound: "/src/frontend/public/ringtone.mp3",
        vibrate: [200, 100, 200]
    };

    const audio = new Audio("/src/frontend/public/ringtone.mp3");
    audio.play();

    self.registration.showNotification(title, notificationOptions);
});
