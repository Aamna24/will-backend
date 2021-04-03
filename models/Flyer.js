const mongoose= require("mongoose")

const flyer = mongoose.Schema({
   
    name: { type: String, required: true },
    img:{type: String},
    description: {type:String, required: true}
   
   
  });
  
  module.exports = mongoose.model("Flyer", flyer);