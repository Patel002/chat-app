import mysql from "mysql2"

const dbConfig = {
    host: process.env.DB_HOST || "bppnidd9dftravakxivc-mysql.services.clever-cloud.com",
    user: process.env.DB_USER || "untlslcyornlvdx1",
    password: process.env.DB_PASSWORD || "IlqALEEfzMSOtxWPwgKW",
    database: process.env.DB_NAME || "bppnidd9dftravakxivc",
    port: process.env.DB_PORT || 3306,
       
}
console.log(dbConfig)

const database = async() => {
    try {
        const db = mysql.createConnection(dbConfig)
        
        db.connect((err) => {
            if (err) {
                console.error('Error connecting to MySQL:', err.message);
                return;
            }
            console.log(`Database connected:${dbConfig.database}`);
        })
    } catch (error) {
        console.error("Error: ", error)
        process.exit(1)
    }
}
export default database
