import express from "express"
import userAuth from "../middleware/userauth.js";
import { filterUsers, getDiscoverFeed, getUserData } from "../controllers/userController.js";
 
const userRouter = express.Router();
userRouter.get('/data', userAuth, getUserData)
userRouter.get("/discover-feed", userAuth, getDiscoverFeed);
userRouter.get("/filter", userAuth, filterUsers);
export default userRouter