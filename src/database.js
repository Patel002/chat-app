import mysql from "mysql2"


const dbConfig = {
    host: "localhost",
    user: "root",
    password: "dhtsol",
    database: "chat_app"    
}


const database = async() => {
    try {
        const db = mysql.createConnection(dbConfig)
        
        db.connect((err) => {
            if(err) {throw err}
            console.log(`Database connected: ${dbConfig.database}`)
        })
    } catch (error) {
        console.error("Error: ", error)
        process.exit(1)
    }
}

export default database
