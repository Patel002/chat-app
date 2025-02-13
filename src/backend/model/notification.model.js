import { sequelize } from "../utils/sequelize.js";
import { DataTypes } from "sequelize";
import { encryptMessages, decryptMessages } from "../utils/crypto.js";

const Notification = sequelize.define('notification',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        }
    },
    fcmToken: {
        type: DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
            this.setDataValue('message', encryptMessages(value))
        }
    },
    seen: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
})

// Notification.sync({alter: true})
// .then(() => console.log("notification table created"))

export default Notification