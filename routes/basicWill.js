var express = require('express');
var route = express.Router();
const mongoose = require("mongoose");
const moment = require('moment')
const BasicWill = require('../models/registerWill')
const Document = require("../models/regDocument")

// basic will registeration route
route.post("/willregisteration",async (req,res)=>{
    const {  requesterTitle, requesterFname, requesterLname, requesterMname,
    requesterAdd, requesterEmail, requesterPhNo, requesterAddLine1,requesterAddLine2,
    requesterTown, requesterCountry, requesterPostCode, promotionCode, requesterSelfie, willStatus,
    willOwnerTitle, willOwnerFname,  willOwnerSurname,willOwnerEmail,  willOwnerMname, 
    willOwnerDob, willOwnerGender, willOwnerAddLine1, willOwnerAddLine2, willOwnerCity,
    willOwnerCountry, willOwnerUK, willOwnerPostcode, willOwnerPhNo,executorName, executorEmailAdd, executorPhoneNo,
    executorAddLine1, executorCity, executorCountry,dateOfWill, storedWillAdd,additionalIns,
    willReminderFr, lastRemDate, nextRemDate,createdWillPDF, discountCode,discountAmount } = req.body;

      
    const newBasicWill = new BasicWill({
        _id: new mongoose.Types.ObjectId(),
        requesterTitle, requesterFname, requesterLname, requesterMname,
    requesterAdd, requesterEmail, requesterPhNo, requesterAddLine1,requesterAddLine2,
    requesterTown, requesterCountry, requesterPostCode, promotionCode, requesterSelfie, willStatus:"Active",
    willOwnerTitle, willOwnerFname,  willOwnerSurname, willOwnerEmail, willOwnerMname, 
    willOwnerDob, willOwnerGender, willOwnerAddLine1, willOwnerAddLine2, willOwnerCity,
    willOwnerCountry, willOwnerUK, willOwnerPostcode,willOwnerPhNo, executorName, executorEmailAdd, executorPhoneNo,
    executorAddLine1, executorCity, executorCountry,dateOfWill, storedWillAdd,additionalIns,
    willReminderFr, lastRemDate, nextRemDate,createdWillPDF, discountCode,discountAmount,
    dateCreated: moment().format('LL')
    
      });
      newBasicWill
      .save()
      .then(response => {
        res.status(200).send({
          success: true,
          message: "Will Successfully created",
          data: response
        });
      })
      .catch(err => {
        res.status(400).send({
          success: false,
          message: "Will already registered",
          Error: err
        });
      });

})

/* GET  basic will listing. */
route.get("/", async (req, res) => {
    try {
      const willData = await BasicWill.find();
      if (willData.length === 0) {
        res.status(200).send({
          success: true,
          data: willData,
          message: "No User registered"
        });
      } else {
        res.status(200).send({
          success: true,
          data: willData
        });
      }
    } catch (err) {
      res.status(503).send({
        success: false,
        message: "Server error"
      });
    }
  });


// search basic will
route.get("/details/:id", async(req,res)=>{

  const {id} = req.params;

  try {
    const result = await BasicWill.findById(id);
    if (result.length === 0) {
      res.status(200).send({
        success: true,
        data: result,
        message: "No Will registered"
      });
    } else {
      res.status(200).send({
        success: true,
        data: result
      });
    }
  } catch (error) {
    res.status(503).send({
      success: false,
      message: "Server error"
    });
  
  }
  
})

/* GET  registered documents listing against each will */
route.get("/registeredDocuments/:id", async (req, res) => {
  const {id} = req.params
  try {
    const docData = await Document.find();
    const result = docData.filter(x=> x.activeWillId === id) 
    if (result.length === 0) {
      res.status(200).send({
        success: true,
        data: result,
        message: "No User registered"
      });
    } else {
      res.status(200).send({
        success: true,
        data: result
      });
    }
   
  } catch (err) {
    res.status(503).send({
      success: false,
      message: "Server error"
    });
  }
});

/* GET each registered document  */
route.get("/documentdetails/:id", async (req, res) => {
  const {id} = req.params
  try {
    const docData = await Document.findById(id);
    //console.log(docData)
    if (docData.length === 0) {
      res.status(200).send({
        success: true,
        data: docData,
        message: "No Document registered"
      });
    } else {
      res.status(200).send({
        success: true,
        data: docData
      });
    }
   
  } catch (err) {
    res.status(503).send({
      success: false,
      message: "Server error"
    });
  }
});

// delete a document
route.delete("/deleteDoc/:id",async(req,res)=>{
  const {id}= req.params;
  try {
    const result = await Document.deleteOne({_id: id});
    if (result.length === 0) {
      res.status(200).send({
        success: true,
        data: result,
        message: "No Document Deleted "
      });
    } else {
      res.status(200).send({
        success: true,
        data: result
      });
    }
   
  } catch (err) {
    res.status(503).send({
      success: false,
      message: "Server error"
    });
  }
  
})


// edit an exisiting document
route.patch("/edit/:id", async(req,res)=>{
  var update = req.body;
  const {id} = req.params
  
  try {
    const result = await Document.updateOne({
      _id: id
    }, {$set:update})
    if (result.length === 0) {
      res.status(200).send({
        success: true,
        data: result,
        message: "No Document Updated"
      });
    } else {
      res.status(200).send({
        success: true,
        data: result
      });
    }
    
  } catch (error) {
    res.status(503).send({
      success: false,
      message: "Server error"
    });
  }
})
module.exports = route;