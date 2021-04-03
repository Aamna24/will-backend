const mongoose= require("mongoose")

const discount = mongoose.Schema({
    
   // reqDate: { type: String, required: true },
    //type needs to be identified
    type: {type:String, required: true},
    fromNoQty:{type: Number, required: true},
    toNoQty:{type:Number, required: true},
    discountPercentage:{type: Number, required: true}
   
   
  });
  
  module.exports = mongoose.model("discount", discount);