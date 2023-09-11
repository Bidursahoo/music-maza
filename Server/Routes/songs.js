const router = require("express").Router();
const {User} = require("../Models/UserModel");
const {Song , validate} = require("../Models/SongModel");
const auth = require("../middlewire/auth");
const admin = require("../middlewire/admin");
const validObjectId = require("../middlewire/validObjectId")


// create song

router.post("/" , admin , (req,res)=>{
    const {error} = validate(req.body);
    if(error) return res.status(400).send({message : error.details[0].message})
    Song(req.body).save().then((song)=>{
        res.status(201).send({data:song , message:"Song Created succesfully"})
    })
})



//get all songs
router.get("/" , (req,res)=>{
    Song.find().then((song)=>{
        res.status(200).send({data:song})
    })
})

//update song
router.put("/:id",[validObjectId,admin],(req,res)=>{
    Song.findByIdAndUpdate(req.params.id, req.body,{new:true}).then((song)=>{
        res.status(200).send({data:song, message:"Updated song Successfully"})
    })
})


//delete song by id

router.delete("/:id",[validObjectId,admin],(req,res)=>{
    Song.findByIdAndDelete(req.params.id).then((song)=>{
        res.status(200).send({message:"Song delete successfully"})
    })
})

//like song

router.put("/like/:id", [validObjectId, auth], (req, res) => {
    Song.findById(req.params.id)
      .then((song) => {
        if (!song) {
          return res.status(404).send({ message: "Song not found" });
        }
        
        User.findOne({_id:req.user._id}).then((users) => {
            if (!users) {
                // console.log(users)
              return res.status(404).send({ message: "User not found" });
            }
  
            const index = users.likedSongs.indexOf(song._id);
  
            if (index === -1) {
              users.likedSongs.push(song._id);
              users.save().then(() => {
                res.status(200).send({ message: "Added to your liked songs" });
              }).catch((error) => {
                res.status(500).send({ message: "Internal server error" });
              });
            } else {
              users.likedSongs.splice(index, 1);
              users.save().then(() => {
                res.status(200).send({ message: "Removed from your liked songs" });
              }).catch((error) => {
                res.status(500).send({ message: "Internal server error" });
              });
            }
          })
          .catch((error) => {
            res.status(500).send({ message: "Internal server error" });
          });
          
      })
      .catch((error) => {
        res.status(500).send({ message: "Internal server error" });
      });
  });


  //get all liked songs

  router.get("/like",auth,(req,res)=>{
    User.findById(req.user._id).then((user)=>{
        Song.find({_id:user.likedSongs}).then((songs)=>{
            res.status(200).send({data:songs})
        })
    })
  })
module.exports = router