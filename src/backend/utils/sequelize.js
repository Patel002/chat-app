import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    'bppnidd9dftravakxivc',
    'untlslcyornlvdx1',
    'IlqALEEfzMSOtxWPwgKW',
    {
        host: 'bppnidd9dftravakxivc-mysql.services.clever-cloud.com', dialect: 'mysql' ,logging: false,
        timezone: '+05:00'
    }
)

export {sequelize};