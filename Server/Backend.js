require("express-async-errors")
require("dotenv").config()
const express = require("express")
const cors = require("cors");
const app = express();
const userRoutes = require("./Routes/user");
const authRoutes = require("./Routes/auth");
const songRoutes = require("./Routes/songs");
const playlistRoutes = require("./Routes/playlist");


app.use(cors())
app.use(express.json())
app.use("/api/users/" , userRoutes);
app.use("/api/login/" , authRoutes);
app.use("/api/songs/" , songRoutes);
app.use("/api/playlists",playlistRoutes);

const DataBaseConnect = require("./DataBaseConnection")


// const port = process.env.PORT
const port = 3005

DataBaseConnect.then(()=>{
    console.log("connected")
}).catch(()=>{
    console.log("error")
})


app.listen(port, (req,res)=>{
    console.log("Listenting");
})