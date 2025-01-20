import {app, port} from "./app.js"
import database from "./database.js";
import http from "http"
import { initSocket } from "./socket.js";



const server = http.createServer(app)

initSocket(server)
// console.log("server",initSocket(server))

database()
.then(() => {
    server.listen(port, ()=> {
        console.log(`Server running on port ${port}`)
    })
})
.catch((error) => {
    console.log("mysql connection error",error)
    process.exit(1)
})

// console.log("db",database)

export {server} 






