import User from "../model/user.model.js";
import Message from "../model/message.model.js";
import { sequelize } from "./sequelize.js";

Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sendMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });

const db = {
    sequelize,
    User,
    Message
}

export default db;