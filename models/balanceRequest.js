const mongoose= require("mongoose")

const balanceRequest = mongoose.Schema({
    
    reqDate: { type: String, required: true },
    reqStatus: {type:String, required: true},
    userName:{type:String},
    bankName:{type:String},
    bankAccountName:{type:String},
    bankAccNo:{type:String},
    commissionBalance:{type:Number}
   
   
   
  });
  
  module.exports = mongoose.model("balanceRequest", balanceRequest);