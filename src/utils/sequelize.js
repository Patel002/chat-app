import { Sequelize } from "sequelize";

const sequelize = new Sequelize('chat_app','root','dhtsol',{host: 'localhost', dialect: 'mysql' ,logging: false})


export {sequelize};