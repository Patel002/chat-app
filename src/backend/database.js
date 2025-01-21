import mysql from "mysql2"

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "dhtsol",
    database: process.env.DB_NAME || "chat_app",
    port: process.env.DB_PORT || 3306   
}

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
