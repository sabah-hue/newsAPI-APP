const mongoose = require('mongoose')

const newsSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },

    description:{
        type:String,
        required:true
    },
    
    image:{
        type:Buffer
    },

    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    }
})

const News = mongoose.model('NEWS',newsSchema)
module.exports = News