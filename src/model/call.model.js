import { sequelize } from "../utils/sequelize";
import { DataTypes } from "sequelize";

const Call = sequelize.define('call',{
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    callType: {
    type: DataTypes.ENUM('Audio', 'Video'),
    allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Ongoing', 'Ended', 'Missed'),
        allowNull: false
    }
})

export default Call