import express from "express";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import connectedUsersRouter from "./routes/connectedUser.routes.js"
import notificationRouter from "./routes/notification.routes.js";
import fcmtokenRouter from "./routes/fcmToken.routes.js";
const app = express();

app.use(express.json());
app.use(express.static('public'));

app.use(cors({
  origin: "https://chat-app-git-main-chill-guys-projects.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE",'PATCH'],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/chat", messageRouter);
app.use("/api/v1/all-users", connectedUsersRouter);
app.use("/api/v1/notification", notificationRouter);
app.use("/api/v1/fcm-token", fcmtokenRouter);

// sequelize.sync({alter: true})
//     .then(() => {
//         console.log('User table recreated.');
//     })
//     .catch((error) => {
//         console.error('Error recreating table:', error);
//     });

export { app };
