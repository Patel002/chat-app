import { DataTypes } from "sequelize";
import { sequelize } from "../utils/sequelize.js";

const Room = sequelize.define('room', {
    roomName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})

export default Room