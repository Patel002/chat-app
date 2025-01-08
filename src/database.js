import mysql from "mysql2"


const dbConfig = {
    host: "YOUR_DATABASE_HOST_NAME",
    user: "YOUR_DATABASE_USERNAME",
    password: "YOUR_DATABASE_PASSWORD",
    database: "YOUR_DATABASE_NAME"    
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
