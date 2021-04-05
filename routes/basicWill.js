var express = require('express');
var route = express.Router();
const mongoose = require("mongoose");
const moment = require('moment')
const BasicWill = require('../models/registerWill')
const Document = require("../models/regDocument")
var cloudinary = require('cloudinary').v2;
const multer = require("multer");
var fs = require('fs');

cloudinary.config({ 
    cloud_name: 'dexn8tnt9', 
    api_key: '828443825275634', 
    api_secret: 'oYWmlitChe7pZ7K9PatCNZaXfMk' 
  });


  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + file.originalname);
    }
  });
  
  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/JPG" ||
      file.mimetype === "image/png"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
const upload = multer({ storage: storage, fileFilter: fileFilter });
// basic will registeration route
route.post("/willregisteration/:id", upload.single('requesterSelfie'),async (req,res)=>{
  const {id} = req.params
  const {requesterTitle,
    requesterFname, 
    requesterLname,
    requesterMname,
    requesterAdd,
    requesterEmail, 
    requesterPhNo, 
    requesterAddLine1,
    requesterAddLine2,
    requesterTown, 
    requesterCountry, 
    requesterPostCode, 
    promotionCode,   willOwnerTitle, 
    willOwnerFname,  
    willOwnerSurname,
    willOwnerEmail,  
    willOwnerMname, 
    willOwnerDob, 
    willOwnerGender, 
    willOwnerAddLine1, 
    willOwnerAddLine2, 
    willOwnerCity,
    willOwnerCountry, 
    willOwnerUK, 
    willOwnerPostcode, 
    willOwnerPhNo,executorName, 
    executorEmailAdd, 
    executorPhoneNo,
    executorAddLine1, executorCity, executorCountry,storedWillAdd,additionalIns,
    willReminderFr, lastRemDate, nextRemDate,createdWillPDF, discountCode,discountAmount,} = req.body
  const path = req.file && req.file.path
  const uniqueFileName = id

  try{
    const image = await cloudinary.uploader.upload(path, {
      public_id: `selfie/${uniqueFileName}`,
      tags: "selfie",
    })
    fs.unlinkSync(path);
      const newBasicWill = new BasicWill({
        _id: new mongoose.Types.ObjectId(),
        requesterTitle,
        requesterFname, 
        requesterLname,
        requesterMname,
        requesterAdd,
        requesterEmail, 
        requesterPhNo, 
        requesterAddLine1,
        requesterAddLine2,
        requesterTown, 
        requesterCountry, 
        requesterPostCode, 
        promotionCode,
        willOwnerTitle, 
        willOwnerFname,  
        willOwnerSurname,
        willOwnerEmail,  
        willOwnerMname, 
        willOwnerDob, 
        willOwnerGender, 
        willOwnerAddLine1, 
        willOwnerAddLine2, 
        willOwnerCity,
        willOwnerCountry, 
        willOwnerUK, 
        willOwnerPostcode, 
        willOwnerPhNo,
        executorName, 
        executorEmailAdd, 
        executorPhoneNo,
        executorAddLine1, executorCity, executorCountry, storedWillAdd,additionalIns,
        willReminderFr, lastRemDate, nextRemDate,createdWillPDF, discountCode,discountAmount,
        requesterSelfie: image && image.url,  
        willStatus:"Active",
        dateCreated: moment().format('LL') 
      });
      const response = await newBasicWill.save();
   
      if(response){
        res.status(201).json({
          success: true,
          data: response,
          message: "Will Successfully added",
      });
     }
     else{
      res.status(501).json({
        success: false,
        data: [],
        message: "Error while creating will",
      });
     }
    }
    catch (error) {
      res.status(501).json({
        success: false,
        data: [],
        message: error.message,
      });
    }
  
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