const mongoose = require("mongoose");
const express = require("express");
var route = express.Router();
var Will = require('../models/willcreation')

// add products
route.post("/createwill",async(req,res)=>{
    const {prefix, firstName,middleName, lastName,add,town,country,
        phNo, email,gender,
        prefix1, firstName1,middleName1, lastName1,add1,town1,country1,
        phNo1, email1,gender1, 
        executors, wives, execRenumeration, children,guardian, beneficiary,
    fnameBef,} = req.body
  
  const newProduct = new Will({
    prefix,
    firstName,
   // wives: wives,
    
  })
  newProduct
  .save()
  .then(response => {
    res.status(200).send({
      success: true,
      message: "Product Created",
      data: response
    });
  })
  .catch(err => {
    res.status(400).send({
      success: false,
      message: "Error: failed",
      Error: err
    });
  });
  
  
  })
module.exports= route