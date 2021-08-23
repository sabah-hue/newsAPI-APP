const express = require('express')
const router = new express.Router()

const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')

///////// Add Reporter with Token///////////////////////////
router.post('/users', async (req, res) => {
        const user = new User(req.body)
        try{
           await user.save()
           const token = await user.generateToken()
           res.status(200).send({user,token})
        }
        catch(e){
            res.status(400).send(e)
        }  
})

/////////////////  Get All Reporters  ///////////////////////////
router.get('/users',auth, (req, res) => {
    User.find({}).then((users) => {
        res.status(200).send(users)
    }).catch((e) => {
        res.status(500).send(e)
    })
})

///////////////////  Get By ID /////////////////////////////////

router.get('/users/:id',auth, (req, res) => {
    console.log(req.params.id)

    const _id = req.params.id
    User.findById(_id).then((user) => {
        if (!user) {
            return res.status(404).send('Unable to find user')
        }
        res.status(200).send(user)
    }).catch((e) => {
        res.status(500).send('Unable to connect to data base' + e)
    })
})

//////////////////  Update //////////////////////////

router.patch("/users/:id",auth, async (req, res) => {
    const updates = Object.keys(req.body)
    console.log(updates)
    const _id = req.params.id;
    try {
        const user = await User.findById(_id)
        if (!user) {
            return res.send("No user is found");
        }
        updates.forEach((update) => user[update] = req.body[update])
        await user.save();

        res.status(200).send(user);
    } catch (e) {
        res.status(400).send('Error' + e);
    }
});

/////////////////////  Delete   ////////////////////////

router.delete('/users/:id',auth, async (req, res) => {
    const _id = req.params.id
    try {
        const user = await User.findByIdAndDelete(_id)
        if (!user) {
            return res.send('No user is found')
        }
        res.send(user)
    }
    catch (e) {
        res.send(e)
    }
})

/////////////////// Login  ////////////////////////////
router.post('/login',async(req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateToken()
        res.send({user,token})
    }
    catch(e){
        res.send('Please Try again ' + e)
    }
})

////////////// logout  ///////////////////////////////
router.delete('/logout',auth,async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((el)=>{
            return el.token !== req.token
        })
        await req.user.save()
        res.send('Logout Successfully')
    }
    catch(e){
        res.send(e)
    }
})

////////////   logoutAll /////////////////////////////

router.delete('/logoutAll',auth,async(req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send('Logout from All devices succesfully')
    }
    catch(e){
        res.send(e)
    }
})


////////////////////// Profile show /////////////////////////////////

router.get('/profile',auth,(req,res)=>{
    res.send(req.user)
})

////////////////////////// profile Image /////////////////////////////
const upload = multer({
    limits:{
        fileSize: 1000000  
    },
    fileFilter(req,file,cb){
       if(!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)){
          return  cb(new Error('Please upload an image'))
        } 
        cb(null, true)  
    }
})

router.post('/profile/image',auth,upload.single('image'),async(req,res)=>{
    try{
        req.user.image = req.file.buffer
        await req.user.save()
        res.send('Image uploaded succesfully')
    }
    catch(e){
        res.send(e)
    }
})

module.exports = router