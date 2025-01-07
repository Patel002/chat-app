import User from "../model/user.model.js";
import Message from "../model/message.model.js";

const getConnectedUsers = async(loggedInUserId) => {
    try {
        const sendMessages = await Message.findAll({
            where:{
                senderId: loggedInUserId
            },

            attributes:[
                'receiverId'
            ],

            group: ['receiverId']
        })

        const receiveMessages = await Message.findAll({
            where:{
                receiverId: loggedInUserId
            },

            attributes:[
                'senderId'
            ],

            group: ['senderId']
        })

        const userId = [
            ...new Set([
                ...sendMessages.map(messages => messages.receiverId),
                ...receiveMessages.map(messages => messages.senderId)
            ])
        ]

        const connectedUsers = await User.findAll({
            where:{
                id: userId
            },

            attributes:[
                'id',
                'userName',
            ]
        })

        return connectedUsers

    } catch (error) {
        console.error(error);
        
    }
}

export { getConnectedUsers}