const mongoose= require("mongoose")

const balanceRequest = mongoose.Schema({
    
  balanceReqID:{type:String},
    reqDate: { type: String, required: true },
    reqStatus: {type:String, required: true},
    userID:{type:String},
    bankName:{type:String},
    bankAccountName:{type:String},
    bankAccNo:{type:String},
    commissionBalance:{type:Number},
    refNo:{type:String}
   
   
   
  });
  
  module.exports = mongoose.model("balanceRequest", balanceRequest);