const mongoose= require("mongoose")

const Voucher = mongoose.Schema({
    
    date: {type:String, required: true},
    userID:{type:String},
    invoiceID:{type:String, required: true},
    b2bClient:{type:String},
    voucherCode:{type: String, required: true},
    status:{type:String, required: true},
    processedBy:{type:String},
    emailTo:[{type:String}],
    paymentNumber:{type:String},
    
    
   
   
  });
  
  module.exports = mongoose.model("voucher", Voucher);