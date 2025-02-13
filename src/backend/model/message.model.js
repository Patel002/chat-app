import { DataTypes } from "sequelize";
import { sequelize } from "../utils/sequelize.js";
import { encryptMessages,decryptMessages} from  "../utils/crypto.js";

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

// console.log(decryptMessages('e2ec9e7b19be11905c802f4de4a67fc1:7c576dc305f7e8d5f5579e730c104362090da75a0a64c0d5fe667aaa4043ba953df361e9f1b0b684071ee75ce4f054ca3afde1942c9a9a7d3de08ab3933add2f8f2262445f90519491f9c44d2acb83327e328d64421ddc5fc0a745ca87771d6d3bf13e9af243453a838b459f01c63a58a11586d9d517ccb579341ed8e20d8d7c58150508a4d2f11a5f45b06ff39fd5e8'))


// Message.sync({alter: true})
// .then(() => console.log("message table created"))
// .catch((error) => console.error("Error while creating message table", error))

export default Message
export {
    decryptMessages,
    encryptMessages
}