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

messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-sw] Background Message received:", payload);

    if(!payload.data) {
        console.warn("No notification payload received.");
        return;
    }
    const channel = new BroadcastChannel("fcm_notifications");
    channel.postMessage(payload.data);

});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow("/chat"));
});
