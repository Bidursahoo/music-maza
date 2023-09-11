const router = require("express").Router();
const {User} = require("../Models/UserModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

router.post("/" , (req,res)=>{
    User.findOne({email:req.body.email}).then((user)=>{
        if(!user){
            return res.status(400).send({message: "Invalid email or password"})
        }else{
            bcrypt.compare(req.body.password , user.password).then((validPass)=>{
                if(!validPass){
                    res.status(400).send({message:"Inavlid Password"})
                }
                else{
                    const tokenPayload = {
                        _id: user._id,
                        isAdmin: user.isAdmin, 
                    };
                    // const token = user.generateAuthTocken();
                    const token = jwt.sign(tokenPayload, process.env.JWTKEY);
                    res.status(200).send({
                        data:token , 
                        message: "Signing in please wait..."
                    })
                }
            }).catch((error) => {
                console.error("Error:", error);
                res.status(500).send({ message: "An error occurred while creating the account." });
              });
        }
    }).catch((error) => {
        console.error("Error:", error);
        res.status(500).send({ message: "An error occurred while checking user existence." });
      });
})


module.exports = router;