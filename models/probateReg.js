const mongoose= require("mongoose")

const ProbateReg = mongoose.Schema({

    date: {type:String, required: true},
    matchedID:{type:String},
    probRegAdd:{type:String, required: true},
    reqTitle:{type:String, required: true},
    reqFname: {type:String, required: true},
    reqMname: {type:String},
    reqLname: {type:String, required: true},
    reqAdd: {type:String, required: true},
    reqEmail: {type:String, required: true},
    reqPhNo: {type:String, required: true},
    reqAddLine1: {type:String, required: true},
    reqAddLine2: {type:String},
    reqTown: {type:String, required: true},
    reqCountry: {type:String, required: true},
    reqPostCode: {type:String, required: true},
    promotionCode: {type:String, required: true},
    requesterSelfie: {type:String, required: true},
    discountApplied:{type:Number, required: true},
    amountPaid:{type:Number, required: true}
   
   
  });
  
  module.exports = mongoose.model("ProbateReg", ProbateReg);