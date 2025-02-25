import { Server } from 'socket.io';
import { getConnectedUsers } from './controllers/userService.controller.js';
import jwt from 'jsonwebtoken';
import db from './utils/associat.js';
import { decryptMessages } from './model/message.model.js';

let io;
let users = [];

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin:"https://chat-app-git-main-chill-guys-projects.vercel.app",
            methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        }
    })

    io.use((socket, next) => {

        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, "somegebrrishwordintextformat")

            socket.user = {
                id: decoded.id,
                socketId: socket.id,
                username: decoded.userName || 'Anonymous',
            };
            const existingUser = users.find((user) => user.id === socket.user.id);
            if (existingUser) {
                existingUser.socketId = socket.id;
            } else {
                users.push(socket.user);
            }

            console.log("users:", socket.user)
            next();

        } catch (error) {
            return next(new Error('Authentication error'));
        }
    })

    io.on('connection', (socket) => {
        console.log('connected', socket.id);

        socket.on("getUsers", async () => {
            try {
                const connectedUsers = await getConnectedUsers(socket.user.id);
                socket.emit('users', connectedUsers);

            } catch (error) {
                console.error('Error while fetching connected users', error);
                socket.emit('error', { message: 'Error while fetching connected users' });
            }
        })

        socket.on("sendMessage", async (data) => {
            try {
                const { content, receiverId } = data;
                const senderId = socket.user.id;

                if (!receiverId) {
                    console.error("Receiver ID is missing!");
                    return;
                }

                console.log(`Sender ID: ${socket.user.id}, Receiver ID: ${receiverId}, Content: ${content}`);

                const message = await db.Message.create({
                    content,
                    senderId,
                    receiverId
                })

                const receiver = users.find((user) => user.id === receiverId);
                const sender = users.find((user) => user.id === senderId);

                if (receiver) {
                    io.to(receiver.socketId).emit("receiveMessage", {
                        id: message.id,
                        content: decryptMessages(message.content),
                        senderId: message.senderId,
                        senderName: sender.username,
                        receiverId: message.receiverId,
                        createdAt: message.createdAt,
                    });
                }

                io.to(socket.id).emit("receiveMessage", {
                    id: message.id,
                    content: decryptMessages(message.content),
                    senderId: message.senderId,
                    senderName: sender.username,
                    receiverId: message.receiverId,
                    createdAt: message.createdAt,
                });

            } catch (error) {
                console.error(error);
            }
            // console.log("Receiver ID:", userId);
        })

        socket.on('updateMessage', ({messageId, updatedContent}) => {
            io.emit('messageUpdated', { messageId, updatedContent });
        })
        
        socket.on('deleteMessage', ({ messageId, senderId, receiverId }) => {
            
            io.to(senderId).emit('messageDeleted', { messageId });
            io.to(receiverId).emit('messageDeleted', { messageId });
            console.log('messageDeleted event emitted to both sender and receiver');
        })
        
        socket.on('cameraSwitched',({to, from}) =>{
            if(!to || !from) return
            io.to(to).emit('cameraSwitched', { from });
        })
        
        socket.on('callStarted', ({ to, from }) => {
            console.log(`[Incoming] callStarted: from ${from} to ${to}`);
            socket.emit('callStarted', { from });
            console.log(`[Outgoing] callStarted: to ${to}`);
        });

        socket.on('callDeclined', ({ to }) => {
            console.log(`[Server] callDeclined: to ${to}`);
            io.to(to).emit('callDeclined'); 
        });
        
        socket.on('videoCallOffer', ({ offer, to, from }) => {
            if(!offer || !to || !from) return
            io.to(to).emit('videoCallOffer', { offer, from });
        });

        socket.on('videoCallAnswer', ({ answer, to, from }) => {
            if(!answer || !to || !from) return
            io.to(to).emit('videoCallAnswer', { answer, from });
        });

        socket.on('endCall', ({ to }) => {
            io.to(to).emit('endCall');
            socket.disconnect(true)
        });

        socket.on("disconnect", () => {
            console.log("disconnected", socket.id);
            users = users.filter(useres => useres.socketId !== socket.id);
            io.emit("users", users);
        })
    })

    return io;
}
export const getSocketInstance = () => io;
