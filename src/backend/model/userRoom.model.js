import { DataTypes } from "sequelize";
import { sequelize } from "../../utils/sequelize.js";

const userRoom = sequelize.define('userRoom', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    roomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Rooms',
            key: 'id'
        }
    }
})

export default userRoom