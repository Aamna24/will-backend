const mongoose= require("mongoose")

const products = mongoose.Schema({
    
    basePrice: { type: Number, required: true },
    name:{type: String, required: true}
   
   
  });
  
  module.exports = mongoose.model("Products", products);