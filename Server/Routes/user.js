const router = require("express").Router();
const { User, validate } = require("../Models/UserModel");
const bcrypt = require("bcrypt");
const auth = require("../middlewire/auth");
const admin = require("../middlewire/admin")
const validObjectId = require("../middlewire/validObjectId")


// create user
router.post("/", (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  User.findOne({ email: req.body.email })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(400).send({ message: "User with given email already exists!!" });
      } else {
        bcrypt
          .genSalt(Number(process.env.SALT))
          .then((salt) => {
            return bcrypt.hash(req.body.password, salt);
          })
          .then((hashedPassword) => {
            const newUser = new User({
              ...req.body,
              password: hashedPassword,
            });
            return newUser.save();
          })
          .then((savedUser) => {
            savedUser.password = undefined;
            savedUser.__v = undefined;
            res.status(200).send({
              data: savedUser,
              message: "Account created successfully",
            });
          })
          .catch((error) => {
            console.error("Error:", error);
            res.status(500).send({ message: "An error occurred while creating the account." });
          });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      res.status(500).send({ message: "An error occurred while checking user existence." });
    });
});


//get all users

router.get("/",admin,(req,res)=>{
  User.find().select("-password-__v").then((users)=>{
    res.status(200).send({data:users})
  })
})


//get user by id

router.get("/:id",[validObjectId,auth], (req,res)=>{
  User.findById(req.params.id).select("-password-__v").then((user)=>{
    res.status(200).send({data:user})
  })
})


//update user by id

router.put("/:id",[validObjectId,auth], (req,res)=>{
  User.findByIdAndUpdate(req.params.id, {$set:req.body},{new:true}).select("-password-__v").then((user)=>{
    res.status(200).send({data:user})
  })
})

//delete user by id

router.delete("/:id",[validObjectId,admin], (req,res)=>{
  User.findByIdAndDelete(req.params.id).then((user)=>{
    res.status(200).send({message:"Succesfullt deleted user"})
  })
})

module.exports = router;
