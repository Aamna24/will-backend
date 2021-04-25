const mongoose= require("mongoose")

const WillCreation = mongoose.Schema({
   
    prefix:{type:String},
    firstName:{type:String},
    middleName:{type:String},
    lastName:{type:String},
    add:{type:String},
    town:{type:String},
    country:{type:String},
    phNo:{type:Number},
    email:{type:String},
    gender:{type:String},
    prefix1:{type:String},
    firstName1:{type:String},
    middleName1:{type:String},
    lastName1:{type:String},
    add1:{type:String},
    town1:{type:String},
    country1:{type:String},
    phNo1:{type:Number},
    email1:{type:String},
    gender1:{type:String},
    wives:[{type:Object}],
    executors:[{type:Object}],
    execRenumeration:{type:String},
    children:[{type:Object}],
    guardian:[{type:Object}],
    beneficiary:{type:String},
    fnameBef:{type:String},
    
   
   
  });
  
  module.exports = mongoose.model("willcreation", WillCreation);