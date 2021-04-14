var express = require('express');
var route = express.Router();
const mongoose = require("mongoose");
const User = require("../models/users");
const DisableUsers = require("../models/disabledUsers")
const Products = require('../models/products')
const Vouchers = require('../models/voucher')
const Document = require("../models/regDocument")
const authMiddleware = require("../middleware/authenticateToken");
const jwt = require("jsonwebtoken");
const Discount = require("../models/discount")
const Invoice = require("../models/invoice")
var voucher_codes = require('voucher-code-generator');
const moment = require('moment')
const Commission = require('../models/commission')

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
/* GET users listing. */
route.get("/", async (req, res) => {
  try {
    const userData = await User.find();
    if (userData.length === 0) {
      res.status(200).send({
        success: true,
        data: userData,
        message: "No User registered"
      });
    } else {
      res.status(200).send({
        success: true,
        data: userData
      });
    }
  } catch (err) {
    res.status(503).send({
      success: false,
      message: "Server error"
    });
  }
});

//Login user route
route.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const getUser = await User.find({
      email,
      password,
     
    });

    if(getUser[0].status==="Disable"){
      res.status(404).send({
        success: false,
        message: "User is disabled!"
      });
    }
    else{
    if (getUser.length > 0 ) {
      let token = jwt.sign({ id: getUser[0]._id, name: getUser[0].name,email: getUser[0].email,
        isAdmin: getUser[0].isAdmin , type: getUser[0].type, code:getUser[0].code}, "secret_key");
      res
        .header("auth-token", token)
        .status(200)
        .send({
          data: getUser,
          message: "Successfully login",
          token,
          
        });
    } else {
      res.status(404).send({
        success: false,
        message: "User not found!"
      });
    }
  }
  }catch (err) {
    res.status(503).send({
      success: false,
      message: "Server error"
    });
  }

})

//Register the user route
route.post("/register/:role", upload.single('selfie'), async (req, res) => {
  const {  email, password, phoneNo, add1, add2, town, country , name} = req.body;
  const {role} = req.params
  const path = req.file && req.file.path
  const uniqueFileName = phoneNo
  const code = voucher_codes.generate({
    length: 5,
    count: 1,
  });
  try{
    const image = await cloudinary.uploader.upload(path, {
      public_id: `selfie/${uniqueFileName}`,
      tags: "selfie",
    })
    fs.unlinkSync(path);
    if(image){
      const newUser= new User({
        _id: new mongoose.Types.ObjectId(),
        email,
        password,
        phoneNo,
        add1,
        add2,
        town,
        country,
        name,
        selfie: image && image.url,  
        type: role,
        isAdmin: false,
        status: "Active",
        code: code[0]
      });
      const response = await newUser.save();
      if(response){
        res.status(201).json({
          success: true,
          data: response,
          message: "User Successfully added",
      });
     }
     else{
      res.status(501).json({
        success: false,
        data: [],
        message: "Error while registering user",
      });
     }
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

// disable user 

// register will document
route.post("/register-document", async(req,res)=>{
  const {docDate, docName, docType, docNo, docDesc, docLoc,activeWillId,issuer} = req.body;

  const newDocument = new Document({
    _id: new mongoose.Types.ObjectId(),
    activeWillId,
    docDate,
    docName,
    docType,
    docNo,
    docDesc,
    docLoc,
    issuer

  });

  newDocument
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
        message: "error registering document",
        Error: err
      });
    });

})




// setup discount
route.post("/setup-discount", async(req,res)=>{
  const{type, fromNoQty, toNoQty, discountPercentage,commissionPercentage} = req.body;
  const code = voucher_codes.generate({
    length: 8,
    count: 1,
    
  
  });
  const newDiscount = new Discount({
    type,
    fromNoQty,
    toNoQty,
    discountPercentage,
    commissionPercentage,
    discountCode: code[0]
  })
  newDiscount
  .save()
  .then(response => {
    res.status(200).send({
      success: true,
      message: "Discount Added",
      data: response
    });
  })
  .catch(err => {
    res.status(400).send({
      success: false,
      message: "Discount failed",
      Error: err
    });
  });

})

// get discounts listing
route.get("/discounts", async(req,res)=>{
  try {
    const discounts = await Discount.find();
    if (discounts.length === 0) {
      res.status(200).send({
        success: true,
        data: discounts,
        message: "No discounts to show"
      });
    } else {
      res.status(200).send({
        success: true,
        data: discounts
      });
    }
  } catch (err) {
    res.status(503).send({
      success: false,
      message: "Server error"
    });
  }

}
)
// diable users
route.post("/disable/:id", async(req,res)=>{
  const {id} = req.params
  const user = await User.updateOne({_id: id},{$set:{ status:"Disable"}})
})

// generate vouchers
route.post("/vouchers",async(req,res)=>{
  const {userID, discountID,paymentNumber,quantity} = req.body
  const codes = voucher_codes.generate({
    length: 8,
    count: 1

});
const invoice = voucher_codes.generate({
  length: 4,
  count: 1,
  charset: "0123456789"

});
const newVoucher = new Vouchers({
  date: moment().format('LL') ,
  userID,
  discountID,
  voucherCode: codes[0],
  voucherStatus:"Not Used",
  paymentNumber,
  quantity: quantity,
  invoiceID: invoice[0]
})
newVoucher
.save()
.then(response => {
  res.status(200).send({
    success: true,
    message: "Voucher Created",
    data: response
  });
})
.catch(err => {
  res.status(400).send({
    success: false,
    message: "Voucher creation failed",
    Error: err
  });
});


})

// get specific voucher detail
route.get("/voucherdetail/:id", async(req,res)=>{
  const {id} = req.params;
  console.log(id)
  try {  const result = await Vouchers.findById(id);
    if (result.length === 0) {
      res.status(200).send({
        success: true,
        data: result,
        message: "No Voucher registered"
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

// get vouchers listing
route.get("/voucherslist", async(req,res)=>{
  try {
    const vouchers = await Vouchers.find();
    if (vouchers.length === 0) {
      res.status(200).send({
        success: true,
        data: vouchers,
        message: "No vouchers to show"
      });
    } else {
      res.status(200).send({
        success: true,
        data: vouchers
      });
    }
  } catch (err) {
    res.status(503).send({
      success: false,
      message: "Server error"
    });
  }

}
)

// add products
route.post("/addproduct",async(req,res)=>{
  const {name, basePrice} = req.body

const newProduct = new Products({
  name,
  basePrice,
  
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

// get products listing
route.get("/products", async(req,res)=>{
  try {
    const products = await Products.find();
    if (products.length === 0) {
      res.status(200).send({
        success: true,
        data: products,
        message: "No products to show"
      });
    } else {
      res.status(200).send({
        success: true,
        data: products
      });
    }
  } catch (err) {
    res.status(503).send({
      success: false,
      message: "Server error"
    });
  }

}
)

// invoice generation by admin
route.post("/generate-invoice",async(req,res)=>{
  const { b2bClient, noOfVoucher , amount, processedBy} = req.body
  console.log(req.body)
  const codes = voucher_codes.generate({
    length: 5,
    count: 1,
    charset: "0123456789"
});
  const newInvoice = new Invoice({
    number: codes[0],
    date: moment().format('LL'),
    b2bClient: b2bClient,
    amount: amount,
    processedBy: processedBy,
    noOfVoucher: noOfVoucher,
    status: "Unpaid",
    paymentID:"",
    
  })
  newInvoice
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

// get invoice listing 
route.get("/invoice",async(req,res)=>{
  try {
    const invoice = await Invoice.find();
    if (invoice.length === 0) {
      res.status(200).send({
        success: true,
        data: invoice,
        message: "No products to show"
      });
    } else {
      res.status(200).send({
        success: true,
        data: invoice
      });
    }
  } catch (err) {
    res.status(503).send({
      success: false,
      message: "Server error"
    });
  }
})

//update invoice status
route.patch("/invoice/:id",async(req,res)=>{
  const {id} = req.params
  var {paymentID} = req.body;
  try {
    const result = await Invoice.updateOne({
      number: id
    }, {$set:{
      paymentID: paymentID,
      status:"Paid"
    }})
    if (result.length === 0) {
      res.status(200).send({
        success: true,
        data: result,
        message: "No Invoice Updated"
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


// add commission
route.post("/generate-commission",async(req,res)=>{
  const { willAmbID, userID , commissionEarned, commissionBalance, productName, userName} = req.body
 
  const newCommission = new Commission({
  
    date: moment().format('LL'),
    willAmbID: willAmbID,
    userID: userID,
    commissionEarned: commissionEarned,
    commissionBalance: commissionBalance,
    commissionStatus: "Unpaid",
    balanceReq:"",
    productName: productName,
    userName: userName
    
  })
  newCommission
  .save()
  .then(response => {
    res.status(200).send({
      success: true,
      message: "Commission Added",
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

// get commission listing
route.get("/commission/:id", async(req,res)=>{
  const {id} = req.params
  try {
    const products = await Commission.find({willAmbID: id});
    if (products.length === 0) {
      res.status(200).send({
        success: true,
        data: products,
        message: "No commission to show"
      });
    } else {
      res.status(200).send({
        success: true,
        data: products
      });
    }
  } catch (err) {
    res.status(503).send({
      success: false,
      message: "Server error"
    });
  }

}
)
module.exports = route;
