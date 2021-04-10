const mongoose= require("mongoose")

const Voucher = mongoose.Schema({
    
    date: {type:String, required: true},
    userID:{type: String},
    discountID:{type:String},
    voucherCode:{type: String, required: true},
    voucherStatus:{type:String, required: true},
    paymentNumber:{type:String},
    quantity:{type:Number},
    invoiceID:{type:String}
   
   
  });
  
  module.exports = mongoose.model("voucher", Voucher);