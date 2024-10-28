import { Router } from "express";
import { db } from "../utils/db.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

const authRouter = Router();

// 🐨 Todo: Exercise #1
// ให้สร้าง API เพื่อเอาไว้ Register ตัว User แล้วเก็บข้อมูลไว้ใน Database ตามตารางที่ออกแบบไว้
authRouter.post("/register", async (req, res) => {
    try {
    const user = {
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName || null,
        lastName: req.body.lastName || null,
    }
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    const collection = db.collection("users");
    await collection.insertOne(user);
   
    return res.json({
        message: "User has been created successfully"
    })
    } catch (error) {
        return res.status(500).json({
            message: "Error creating new user",
        });
    }
})

// 🐨 Todo: Exercise #3
// ให้สร้าง API เพื่อเอาไว้ Login ตัว User ตามตารางที่ออกแบบไว้
authRouter.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required",
        });
    }
    
    const user = await db.collection("users").findOne({ username });

    if (!user) {
         return res.status(404).json({
              message: "User not found",
         });
    };

    const isValidPassword = await bcrypt.compare(
         password,
         user.password
    );

    if (!isValidPassword) {
         return res.status(400).json({
              message: "Password not valid",
         });
    };

    const token = jwt.sign(
         { 
              id: user._id, 
              firstName: user.firstName, 
              lastName: user.lastName 
         },
         process.env.SECRET_KEY,
         {
              expiresIn: "900000",
         }
    );

    return res.json({
         message: "Login successfully",
         token,
    });
});

export default authRouter;
