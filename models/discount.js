const mongoose= require("mongoose")

const discount = mongoose.Schema({
    
   // reqDate: { type: String, required: true },
    type: {type:String, required: true},
    fromNoQty:{type: Number},
    toNoQty:{type:Number},
    discountPercentage:{type: Number, required: true},
    commissionPercentage:{type:Number, required: true},
    discountCode:{type:String, required: true}
   
   
  });
  
  module.exports = mongoose.model("discount", discount);