import { app } from "./app.js"
import database from "./database.js";
import http from "http"
import { initSocket } from "./socket.js";
import dotenv from "dotenv"

const port = process.env.PORT || 7116

const env = dotenv.config({
    path: "./.env"
})

// console.log(env)

const server = http.createServer(app)

initSocket(server)
// console.log("server",initSocket(server))

database()
    .then(() => {
        server.listen(port, () => {
            console.log(`Server running on port ${port}`)
        })
    })
    .catch((error) => {
        console.log("mysql connection error", error)
        process.exit(1)
    })

// console.log("db",database)

export { server }
export default app
