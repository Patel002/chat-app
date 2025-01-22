import { DataTypes } from "sequelize";
import { sequelize } from "../utils/sequelize.js";
import crypto from "crypto";


const algorithm = 'aes-256-cbc';
const key = Buffer.from('de568fc97a511aea9bc27b068c50a3b81ad4773114c176b78995c266c8bea098', 'hex');

// const ivString = '2bf2b0dc434d9781f29c9c85c941046e'; 
const iv = crypto.randomBytes(16);
const encryptMessages = (content) => {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(content, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    const encryptedMessage = `${iv.toString('hex')}:${encrypted}`;
    return (encryptedMessage)
}

const decryptMessages = (encryptedMessages) => {
    try {
        if (encryptedMessages.includes(':')) {
            const [ivHex, encrypted] = encryptedMessages.split(':');
            if (!ivHex || !encrypted) {
                throw new Error("Invalid encrypted encryptedMessages format");
            }
            const iv = Buffer.from(ivHex, 'hex');
            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            const decryptedBuffer = Buffer.concat([
                decipher.update(Buffer.from(encrypted, 'hex')),
                decipher.final()
            ]);
            return decryptedBuffer.toString('utf-8');
        } else {
            return encryptedMessages;
        }
    } catch (error) {
        console.error("Decryption failed:", error.message);
        throw new Error("Decryption error");
    }
};

const Message = sequelize.define('message', {
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        set(value) {
            this.setDataValue('content', encryptMessages(value))
        }
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    timestamps: true,
})

// console.log(decryptMessages('ee4ad6664ccbc19b8940a493aab043df:6dbbae50f7c55acf818f5bd6fd96f0ad5b7a319fa47efc7c79e2dea0a0a75bc9db1b5f6d29180b3559391588faf71400d65f697e7c06b6587f8b2c4bb9ca787fb6aa069719a95a49964bd6c0001a11dbdeb53d05abbbe4b74bf1fc051edf8f4fef3ce9c7ceb84b1debd879047954157593560407ac88e3a412eb8d616772fbd5'))


// Message.sync({alter: true})
// .then(() => console.log("message table created"))
// .catch((error) => console.error("Error while creating message table", error))

export default Message
export {
    decryptMessages,
    encryptMessages
}