import Message from "../model/message.model.js";
import jwt from "jsonwebtoken"
import { Op } from "sequelize";
import db from "../utils/associat.js";
import { decryptMessages } from "../utils/crypto.js"
const sendMessage = async (req, res) => {
  try {

    const { reciverId, content } = req.body

    const token = req.headers.authorization.split('')[1]
    const decoded = jwt.verify(token, "somegebrrishwordintextformat")
    const senderId = decoded.id
    // console.log(senderId)

    const message = await Message.create({
      senderId,
      reciverId,
      content
    })
    return res.status(201).json({
      id: message.id,
      content: message.content,
      reciverId: message.reciverId,
      senderId: message.senderId,
      createdAt: message.createdAt,

    })

  } catch (error) {
    return res.status(400).json({
      Message: "error while sending message",
      error: error.message
    })
  }
}

const getAllMessage = async (req, res) => {
  try {

    const { userId1, userId2 } = req.params
    let { offset = 0, limit = 20 } = req.query

    offset = parseInt(offset, 10)
    limit = parseInt(limit, 10)

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 }
        ],
      },
      include: [
        { model: db.User, as: 'sender' },
        { model: db.User, as: 'receiver' }
      ],

      order: [['createdAt', 'ASC']],
      offset,
      limit

    });
    const decryptedMessages = messages.map((message) => {
      // console.log("Decrypting message:", message.content);
      try {
        return {
          ...message.toJSON(),
          content: decryptMessages(message.content)
        };
      } catch (err) {
        console.error("Failed to decrypt message:", message.content);
        return {
          ...message.toJSON(),
          content: "Decryption failed"
        };
      }
    });

    return res.status(200).json({ messages: decryptedMessages });
  } catch (error) {
    console.error("Error while getting messages:", error.message);
    return res.status(400).json({
      message: "Error while getting messages",
      error: error.message
    });
  }
};

const updateMessage = async(req, res) => {
  try{
    const {messageId} = req.params
    const {content} = req.body

    const message = await Message.findByPk(messageId)
    if(!message){
      return res.status(502).json({
        message: "Message not found"
      })
    }
    await message.update({content})
    return res.status(200).json({
      updatedMessage: message
    })
  }catch(error){
    return res.status(400).json({
      message: "Error while updating message",
      error: error.message
    })
  }
}

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params

    const message = await Message.findByPk(messageId)

    if (!message) {
      return res.status(404).json({
        message: "Message not found"
      })
    }

    await message.destroy()

    return res.status(200).json({
      message
    })
  } catch (error) {
    console.log("Something error while deleting messages", error)
    return res.status(400).json({
      error: error.message
    })
  }
}

export {
  sendMessage,
  getAllMessage,
  deleteMessage,
  updateMessage
}
