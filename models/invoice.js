const mongoose= require("mongoose")

const Invoice = mongoose.Schema({
    
    date: {type:String, required: true},
    number:{type: String},
    b2bClient:{type:String},
    noOfVoucher:{type: Number},
    amount:{type:Number},
    processedBy:{type:String},
    status:{type:String},
    paymentID:{type:String}
   
   
  });
  
  module.exports = mongoose.model("invoice", Invoice);