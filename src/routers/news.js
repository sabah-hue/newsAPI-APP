const express = require('express')
const News = require('../models/news')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')


//////////  Add News  ///////////////////
router.post('/news',auth,async(req,res)=>{
    const news = new News({...req.body,owner:req.user._id})
    try{
        await news.save()
        res.send(news)
    }
    catch(e){
        res.send(e)
    }
})

///////////  Get all News /////////////////////////

router.get('/news',auth,async(req,res)=>{
    try{
       await req.user.populate('news').execPopulate()
       res.send(req.user.news)
    }
    catch(e){
        res.send(e)
    }
})

//////////  Get by id  //////////////////

router.get('/news/:id',auth,async(req,res)=>{
    const _id = req.params.id
    try{
        const news = await News.findOne({_id,owner:req.user._id})
        if(!news){
            return res.send('news not found')
        }
        res.send(news)
    }
    catch(e){
        res.send(e)
    }
})

/////////////   patch   //////////////////////
router.patch('/news/:id',auth,async(req,res)=>{
    const _id = req.params.id
    const updates = Object.keys(req.body)
    try{
        const news = await News.findOne({_id,owner:req.user._id})
        if(!news){
            return res.status(404).send('Task is not found')
        }
        updates.forEach((update)=> news[update] = req.body[update])
        await news.save()
        res.send(news)
    }
    catch(e){
        res.send(e)
    }

})

//////////////  Delete  //////////////////////////
router.delete('/news/:id',auth,async(req,res)=>{
    const _id = req.params.id
    try{
        const news = await News.findOneAndDelete({_id,owner:req.user._id})
        if(!news){
            return res.send('news is not found')
        }
        res.send(news)
    }
    catch(e){
        res.send(e)
    }
})

////////////////////////// News Image /////////////////////////////
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
//////// id : news's ID  ////////////////////////////////////
router.post('/addimage/:id',auth,upload.single('image'),async(req,res)=>{
    const _id = req.params.id
    try{
        const news = await News.findOne({_id,owner:req.user._id})
        if(!news){
            return res.send('No news To add image')
        }
        news.image = req.file.buffer
        await news.save()
        res.send('Image uploaded succesfully')
    }
    catch(e){
        res.send(e)
    }
})

/////////////////////////////////////////////////////
module.exports = router