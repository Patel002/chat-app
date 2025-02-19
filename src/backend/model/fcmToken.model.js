import { sequelize } from "../utils/sequelize.js";
import { DataTypes } from "sequelize";

const FcmToken = sequelize.define('fcmToken', {
    fcmToken: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        unique: true
    }
},{
    timestamps: true
});

 FcmToken.sync({alter: true})
.then(() => console.log("FCM Token table created"))

export default FcmToken