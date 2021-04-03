var express = require('express');
var route = express.Router();
const mongoose = require("mongoose");
const BalanceReq = require("../models/balanceRequest")

//gnerate balance 
route.post("/generateBalance", async (req, res) => {
    const {  reqDate, reqStatus } = req.body;
    
    const newBalanceReq = new BalanceReq({
      _id: new mongoose.Types.ObjectId(),
      reqDate,
      reqStatus
  
    });
  
    newBalanceReq
      .save()
      .then(response => {
        res.status(200).send({
          success: true,
          message: "Successfully Registered",
          data: response
        });
      })
      .catch(err => {
        res.status(400).send({
          success: false,
          message: "Balane already registered",
          Error: err
        });
      });
  });
module.exports = route;