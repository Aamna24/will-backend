const mongoose= require("mongoose")

const balanceRequest = mongoose.Schema({
    
    reqDate: { type: String, required: true },
   // img:{type: String, required: true},
    reqStatus: {type:String, required: true},
   
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    }
   
  });
  
  module.exports = mongoose.model("balanceRequest", balanceRequest);