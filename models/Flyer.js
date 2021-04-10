const mongoose= require("mongoose")

const flyer = mongoose.Schema({
   
    name: { type: String, required: true },
    img:{type: String},
    description: {type:String, required: true},
    type:{type:String}
   
   
  });
  
  module.exports = mongoose.model("Flyer", flyer);