const mongoose = require("mongoose");
const {Schema} = mongoose;
const jwt = require("jsonwebtoken");
const joi = require("joi");
const passwordComplexity = require("joi-password-complexity")

const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:true
    },
    month:{
        type:String,
        required:true
    },
    day:{
        type:String,
        required:true
    },
    year:{
        type:String,
        required:true
    },
    likedSongs:{
        type:[String],
        default: []
    },
    playlists:{
        type:[String],
        default: []
    },
    isAdmin:{
        type:Boolean,
        default:false
    }
})

userSchema.methods.generateAuthTocken = ()=>{
    return jwt.sign({_id:this._id , name:this.name , isAdmin:this.isAdmin} , process.env.JWTKEY,{expiresIn:"7d"})
}

const validate = (user) =>{
    const schema = joi.object({
        name: joi.string().min(5).max(10).required(),
        email:joi.string().email().required(),
        password: passwordComplexity().required(),
        month:joi.string().required(),
        day:joi.string().required(),
        year:joi.string().required(),
        gender:joi.string().valid("male" , "female").required()
    });
    return schema.validate(user);
}

User = mongoose.model("user" , userSchema) 

module.exports = {User , validate}