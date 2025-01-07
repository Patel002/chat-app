import { DataTypes } from "sequelize"
import { sequelize } from "../utils/sequelize.js"
import bcrypt from "bcrypt"


const User = sequelize.define('user',{
        userName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },

        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true,
                is: {
                args: /^[a-zA-Z0-9]{8,16}$/,
                msg: 'Password must be 8 to 16 characters long and contain only letters and numbers'
                }
            }
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate:{
                isEmail: true
            }
        },
        
},{
    timestamps: true
})

User.beforeSave( async(user) => {
    if (user.password) {
        user.password = await bcrypt.hash(user.password, 10); 
    }
})
User.prototype.validatePassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

// User.sync({alter: true})
// .then(() => console.log("user table created"))
// .catch((error) => console.error("Error while creating user table", error))

export default User