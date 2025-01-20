import mysql from "mysql2"


const dbConfig = {
    host: "localhost",
    user: "root",
    password: "dhtsol",
    database: "chat_app",
    port: 3306
}


const database = async() => {
    try {
        const db = mysql.createConnection(dbConfig)
        
        db.connect((err) => {
            if (err) {
                console.error('Error connecting to MySQL:', err.message);
                return;
            }
            console.log(`Database connected: ${dbConfig.port}/${dbConfig.database}`);
        })
    } catch (error) {
        console.error("Error: ", error)
        process.exit(1)
    }
}

export default database
