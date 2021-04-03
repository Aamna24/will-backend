const mongoose= require("mongoose")

const products = mongoose.Schema({
    
    basePrice: { type: Number, required: true },
   
   
  });
  
  module.exports = mongoose.model("Products", products);