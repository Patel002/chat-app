import express from "express";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import connectedUsersRouter from "./routes/connectedUser.routes.js"
const app = express();

app.use(express.json());

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


app.use("/api/v1/user", userRouter);
app.use("/api/v1/chat", messageRouter);
app.use("/api/v1/all-users", connectedUsersRouter);

// sequelize.sync({alter: true})
//     .then(() => {
//         console.log('User table recreated.');
//     })
//     .catch((error) => {
//         console.error('Error recreating table:', error);
//     });

export { app };
