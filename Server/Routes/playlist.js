const router = require("express").Router();
const {Playlist , validate} = require("../Models/PlaylistModel")
const {Song} = require("../Models/SongModel")
const {User} = require("../Models/UserModel")
const auth = require("../middlewire/auth")
const validObjectId = require("../middlewire/validObjectId");
const joi = require("joi");

//create playlist 
router.post("/",auth,(req,res)=>{
    const {error} = validate(req.body);
    if(error) return res.status(400).send({
        message: error.details[0].message
    })
    User.findById(req.user._id).then((user)=>{
        Playlist({...req.body , user:user._id}).save().then((playlist)=>{
            user.playlists.push(playlist._id);
            user.save().then((use)=>{
                res.status(201).send({data:playlist})
            })
        })
    })
})


//edit playlist by id
router.put("/edit/:id",[validObjectId,auth] , (req,res)=>{
    const schema = joiobject({
        name: joi.string().required(),
        desc: joi.string().allow(""),
        img: joi.string().allow("")
    })
    const {error} = schema.validate(req.body);
    if(error) return res.status(400).send({message: error.details[0].message})

    Playlist.findById(req.params.id).then((playlist)=>{
        if(!playlist){
            return res.status(404).send({message:"Playlist not found"})
        }
        User.findById(req.user._id).then((user)=>{
            if(user._id.equals(playlist.user)){
                return res.status(403).send({message: "User dont have access to edit"})
            }
            playlist.name = req.body.name;
            playlist.desc = req.body.desc;
            playlist.img = req.body.img;
            playlist.save().then((saved)=>{
                res.status(200).send({message: "Updated SUccesfully"})
            })
        })
    })
})


//add song to playlist
router.put("/add-song", auth, (req,res)=>{
    const schema = joi.object({
        playlistId: joi.string().required(),
        songId: joi.string().required(),

    })
    const {error} = schema.validate(req.body);
    if(error) return res.status(400).send({message: error.details[0].message})
    User.findById(req.user._id).then((user)=>{
        Playlist.findById(req.body.playlistId).then((playlist)=>{
            if(user._id.equals(playlist.user)){
                return res.status(403).send({message: "User dont have access to add songs"})
            }
            if(playlist.songs.indexOf(req.body.songId)===-1){
                playlist.songs.push(req.body.songId)
            }
            playlist.save().then((saved)=>{
                res.status(200).send({data:playlist , message:"Added to playlist"})

            })
        })
    })
})

//remove song from playlist

router.put("/remove-song" , auth ,(req,res)=>{
    const schema = joi.object({
        playlistId: joi.string().required(),
        songId: joi.string().required(),

    })
    const {error} = schema.validate(req.body);
    if(error) return res.status(400).send({message: error.details[0].message})
    User.findById(req.user._id).then((user)=>{
        Playlist.findById(req.body.playlistId).then((playlist)=>{
            if(user._id.equals(playlist.user)){
                return res.status(403).send({message: "User dont have access to remove"})
            }
            const index = playlist.songs.indexOf(req.body.songId);
            playlist.songs.splice(index,1);
            playlist.save().then(()=>{
                res.send(200).send({data:playlist , message: "Removed From Playlist "});
            })
            
        })
    })
} )


//user favorite playlist
router.get("/favorite" , auth , (req,res)=>{
    User.findById(req.user._id).then((user)=>{
        Playlist.find({_id: user.playlists}).then((playlist)=>{
            res.status(200).send({data:playlist})
        })
    })
})

//get random playlist


router.get("/random", auth , (req,res)=>{
    Playlist.aggregate([{$sample: {size:10}}]).then((fetched)=>{
        res.status(200).send({data:fetched});
    })
})


//get playlist by id

router.get("/:id" , [validObjectId , auth] , (req,res)=>{
    Playlist.findById(req.params.id).then((playlist)=>{
        if(!playlist) return res.status(404).send("not found");
        Song.find({_id: playlist.songs}).then((songs)=>{
            res.status(200).send({data:{playlist,songs}})
        })
    })
})

//get all playlist
router.get("/",auth,(req,res)=>{
    Playlist.find().then((playlists)=>{
        res.status(200).send({
            data:playlists
        })
    })
})
//delete playlist by id
router.delete("/:id",[validObjectId , auth] , (req,res)=>{
    User.findById(req.user._id).then((user)=>{
        Playlist.findById(req.params.id).then((playlist)=>{
            if(user._id.equals(playlist.user)){
                return res.status(403).send({message: "User dont have access to remove"})
            }
            const index = user.playlists.indexOf(req.params.id);
            user.playlists.splice(index,1);
            user.save().then(()=>{
                playlist.remove().then(()=>{
                    res.status(200).send({message: "Removed from library"})
                })
            })
        })
    })
})

module.exports = router;