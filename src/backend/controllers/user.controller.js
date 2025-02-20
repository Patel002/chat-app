import User from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

const registerUser = async (req, res) => {
    const { userName, password, email } = req.body
    // console.log(req.body)

    if(!userName && !password) {
        return res.status(400).json({
            message: "Username and password are required"
        })
    }
 try {

    const checkUser = await User.findOne({where: {userName}})
    // console.log(checkUser)
    if(checkUser) {
            res.status(401).json({
                message: "User already exists"
            })
    }
    const user = await User.create({
        userName,
        password,
        email
    })
    // console.log(user)
    return res.status(201).json({
        message: "User registered successfully",
        user
    })
    
 } catch (error) {
    return res.status(400).json({
        message: "Something went wrong while registering user",
        error: error.message
    })
 }
}

const loginUser = async (req, res) => {
    const{ userName, password } = req.body
    // console.log(req.body)

    if(!userName && !password) {
        return res.status(400).json({
            message: "Username and password are required for login"
        })
    }
    try {

        const user = await User.findOne({where: {userName}})
        // console.log(user)
        if(!user) {
           return res.status(400).json({
                message: "User not found",
            })
        }
        const isPasswordValid = await user.validatePassword(password)
        // console.log(isPasswordValid)

        if(!isPasswordValid) {
           return res.status(400).json({
                message: "You are Unauthorized to login"
            })
        }

        const token = jwt.sign({
            id: user.id,
            password,
            userName
        }, "somegebrrishwordintextformat", {expiresIn: "8h"})
        // console.log(token)
        // console.log(user.id)

       return res.status(200).json({
            message: "Login successful",
            loginData: user,
            token: token
        })
        
    } catch (error) {
        console.error("Error while login user", error)
        return res.status(400).json({
            message: "Something went wrong while logging in user",
            error: error.message
        })
    }

}

const getAllRegisterdUsers = async (req, res) => {

    const { userId,userName } = req.params


    if(!userId && !userName) {
        return res.status(400).json({
            message: "User Id and Username are required"
        })
    }
    try {
       const users = await User.findOne({
        where: {
            [Op.or]: [
               userId? {id: userId} : null,
               userName? {userName: userName} : null
            ]
        }
    })

    if(!users) {
        return res.status(404).json({
            message: "User not found"
        })
    }

       return res.status(200).json({
            message: "user found",
            users: {
                id: users.id,
                userName: users.userName
            }
        })

        
    } catch (error) {
        console.error("Error while fetching all users", error)
        return res.status(500).json({
            message: "Something went wrong while fetching all users",
            error: error.message
        })
    }
}

const userEmailVerification = async (req, res) => {
    const { userName } = req.body

    try {
        const user = await User.findOne({where: {userName}})
        if(!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        return res.status(201).json({
            message: "Email sent successfully",
            email: user.email
        })
    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong while sending email",
            error: error.message
        })
    }
}

export { 
    registerUser,
    loginUser,
    getAllRegisterdUsers,
    userEmailVerification
}