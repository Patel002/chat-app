import Notification from '../model/notification.model.js'
import FcmToken from '../model/fcmToken.model.js'
import admin from '../firebase/firebaseAdmin.js'
import { decryptMessages } from '../utils/crypto.js'    

const storeNotification = async (req, res) => {
    try {
        const { userId, title, message } = req.body

        if(!userId || !message ) {
            return res.status(400).json({message: "Please provide all fields", success: false})
        }
        const receiverTokenEntry = await FcmToken.findOne({ where: { userId } });

        if (!receiverTokenEntry) {
            return res.status(404).json({ message: "FCM Token not found", success: false });
        }
        // console.log(receiverTokenEntry)

        const fcmToken = receiverTokenEntry.fcmToken;
        
        const payload = {
            data: {
                title: title,
                body: message,
                receiverId: userId.toString(),
            },
            token: fcmToken,
        };

        console.log(payload,"this is payload")

        try {
            const response = await admin.messaging().send(payload);
            console.log("Notification sent:", response);
        } catch (error) {
            if (error.code === 'messaging/registration-token-not-registered') {
                console.log("Invalid token. Deleting from database:", fcmToken);
                await receiverTokenEntry.destroy();
                return res.status(400).json({ message: "Invalid FCM Token. Removed from DB.", success: false });
            }
            console.log("Error sending notification:", error);
            throw error;
        }

        const notification = await Notification.create({
            userId: userId,
            title,
            message,
            fcmToken,
            seen: false
        })
        
        return res.status(201).json({message: "Notification stored in database",notification, success: true})

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: error.message, 
            success: false
        })
    }
}
    
const getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await Notification.findAll({
            where: { userId },
            order: [["createdAt", "DESC"]],

        })
        const decryptedMessages = notifications.map((notifications) => {
            // console.log("Decrypting message:", notifications.message);
            try {
              return {
                ...notifications.toJSON(),
                content: decryptMessages(notifications.message)
              };
            } catch (err) {
              console.error("Failed to decrypt message:", notifications.message);
              return {
                ...notifications.toJSON(),
                content: "Decryption failed"
              };
            }
          });
        return res.status(200).json({
            decryptedMessages, success: true
        })

    } catch (error) {
        console.log("getNotifications error",error)
        return res.status(500).json({
            message: error.message, 
            success: false
        })
    }
}

const markSeenNotification = async (req,res) => {
    try {
        const { userId } = req.params;

        const notification = await Notification.update(
            { seen: true },
            { where: { userId, seen: false } }  
        );

        return res.status(200).json({
            message: "Notification seen",
            notification,
            success: true
        })

    } catch (error) {
        console.log("seenNotification", error)
        return res.status(500).json({message: error.message, success: false})
    }
}

const updateToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        if(!fcmToken) {
            return res.status(400).json({message: "FCM Token is required", success: false})
        }
    
        await Notification.update({fcmToken}, {where: {userId: req.user.id}})
    
        return res.status(200).json({message: "FCM Token updated", success: true})
    } catch (error) {
        console.log("updateToken", error)
        return res.status(500).json({message: error.message, success: false})
    }

}

export {
        storeNotification,
        getNotifications,
        markSeenNotification,
        updateToken
}