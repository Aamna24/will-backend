var express = require('express');
var route = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
var voucher_codes = require('voucher-code-generator');
const moment = require('moment')
var cloudinary = require('cloudinary').v2;
const multer = require("multer");
var fs = require('fs');
const nodemailer = require("nodemailer");

const User = require("../models/users");
const Products = require('../models/products')
const Vouchers = require('../models/voucher')
const Document = require("../models/regDocument")
const Discount = require("../models/discount")
const Commission = require('../models/commission')
const BalanceReq = require('../models/balanceRequest');
const Sales = require('../models/sales')
const transactions = require('../models/transactions');


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
      res.status(400).send({
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
  const{type, fromNoQty, toNoQty, discountPercentage,commissionPercentage,amount,updatedBy} = req.body;
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
    discountCode: code[0],
    amount,
    updatedBy,
    date: moment().format('LL')
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
// disable users
route.patch("/disable/:id", async(req,res)=>{
  const {id} = req.params
 
  try {
    const result = await User.updateOne({_id: id},{$set:{ status:"Disable"}})
    if (result.length === 0) {
      res.status(200).send({
        success: true,
        data: result,
        message: "No User disabled"
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

// activate user
route.patch("/activate/:id", async(req,res)=>{
  const {id} = req.params
 
  try {
    const result = await User.updateOne({_id: id},{$set:{ status:"Activate"}})
    if (result.length === 0) {
      res.status(200).send({
        success: true,
        data: result,
        message: "No User disabled"
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


// generate vouchers
route.post("/vouchers",async(req,res)=>{
  const {userid, paymentNumber,b2bClient, invoiceID} = req.body

  const codes = voucher_codes.generate({
    length: 8,
    count: 1

});

const newVoucher = new Vouchers({
  date: moment().format('LL') ,
  userID: userid,
  voucherCode: codes[0],
  status:"Not Used",
  paymentNumber:paymentNumber,
  invoiceID: invoiceID,
  b2bClient: b2bClient,
  emailTo:"",
  

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

// post transaction 
route.post("/transaction",async(req,res)=>{
  const {userid, discountID,paymentNumber,quantity,b2bClient,processedBy,amount} = req.body
  const invoice = voucher_codes.generate({
    length: 5,
    count: 1,
    charset: "0123456789"
  
  });
  
const newTransaction = new transactions({
  date: moment().format('LL') ,
  userID: userid,
  discountID,
  paymentNumber:paymentNumber,
  quantity: quantity,
  invoiceID: invoice[0],
  b2bClient: b2bClient,
  amount: amount,
  processedBy: processedBy,
})
newTransaction
.save()
.then(response => {
  res.status(200).send({
    success: true,
    message: "Transaction Added",
    data: response
  });
})
.catch(err => {
  res.status(400).send({
    success: false,
    message: "Transaction failed",
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


// get b2b voucher transactions
route.get("/transactionlist", async(req,res)=>{
  try {
    const transaction = await transactions.find();
    if (transaction.length === 0) {
      res.status(200).send({
        success: true,
        data: transaction,
        message: "No transaction to show"
      });
    } else {
      res.status(200).send({
        success: true,
        data: transaction
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
  const {name, basePrice, updatedBy} = req.body

const newProduct = new Products({
  name,
  basePrice,
  updatedBy
  
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

// update pricing of products
route.patch("/updateproduct", async(req,res)=>{
  var {product, amount} = req.body;
  console.log(req.body)
  
  try {
    const result = await Products.updateOne({
      name: product
    }, {$set:{
      basePrice :amount
    }})
    if (result.length === 0) {
      res.status(200).send({
        success: true,
        data: result,
        message: "No Product Updated"
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
/*route.post("/generate-invoice",async(req,res)=>{
  const { b2bClient, noOfVoucher , amount, processedBy} = req.body
  console.log(req.body)
  const codes = voucher_codes.generate({
    length: 4,
    count: 1,
    charset: "0123456789"
});
const codes1 = voucher_codes.generate({
  length: 8,
  count: 1,
});
  const newInvoice = new Invoice({
    invoiceID: codes[0],
    date: moment().format('LL'),
    b2bClient: b2bClient,
    amount: amount,
    processedBy: processedBy,
    quantity: noOfVoucher,
    status: "Not Used",
    paymentID:"",
    voucherCode: codes1[0]
    
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
/*route.get("/invoice",async(req,res)=>{
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
*/

// add commission
route.post("/generate-commission",async(req,res)=>{
  const { willAmbID, userID , commissionEarned, commissionBalance, productName, userName,salesID} = req.body
 
  const newCommission = new Commission({
  
    date: moment().format('LL'),
    willAmbID: willAmbID,
    userID: userID,
    commissionEarned: commissionEarned,
    commissionBalance: commissionBalance,
    commissionStatus: "Unpaid",
    balanceReq:"",
    productName: productName,
    userName: userName,
    salesID: salesID
    
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

// update commission table
route.patch("/commissions/:id",async(req,res)=>{
  const {id} = req.params
  var {balanceReqID} = req.body;
  
  try {
    const result = await Commission.updateMany({
     willAmbID: id,
     commissionStatus:"Unpaid"
    },{$set:{
      commissionStatus: "Pending Payment",
      balanceReq: balanceReqID
      
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

// generate balance req

route.post("/generate-balancereq",async(req,res)=>{
  const { userName, bankName , bankAccountName, commissionBalance, bankAccNo} = req.body
 
  const newbalanceReq = new BalanceReq({
  
    reqDate: moment().format('LL'),
    userName: userName,
    userID: userID,
    bankName: bankName,
    bankAccountName: bankAccountName,
    bankAccNo: bankAccNo,
    commissionBalance: commissionBalance,
    reqStatus:"Unpaid"
   
    
  })
  newbalanceReq
  .save()
  .then(response => {
    res.status(200).send({
      success: true,
      message: "Balance Req Added",
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


//update invoice status
route.patch("/invoice/:id",async(req,res)=>{
  const {id} = req.params
  var {paymentID} = req.body;
  try {
    const result = await transactions.updateOne({
      invoiceID: id
    }, {$set:{
      paymentNumber: paymentID,
      
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

// update user
route.patch("/editprofile/:id",async(req,res)=>{
  const {id} = req.params
  
  var update = req.body;
  console.log(update)
  try {
    const result = await User.updateOne({
      _id: id
    }, {$set:update})
    if (result.length === 0) {
      res.status(200).send({
        success: true,
        data: result,
        message: "No Profile Updated"
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

// add sales
route.post("/sales", async(req,res)=>{
  const{product, amount, transactionID, promoCode} = req.body;
  const code = voucher_codes.generate({
    length: 5,
    count: 1,
    charset: "0123456789"
  });
  const newSales = new Sales({
    
    salesID: code[0],
    date:moment().format('LL') ,
    productName: product,
    amount,
    transactionID,
    promoCode
  })
  newSales
  .save()
  .then(response => {
    res.status(200).send({
      success: true,
      message: "Sale Added",
      data: response
    });
  })
  .catch(err => {
    res.status(400).send({
      success: false,
      message: "Sale failed",
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

// get all sales

route.get("/sales", async(req,res)=>{
  try {
    const sales = await Sales.find();
    if (sales.length === 0) {
      res.status(200).send({
        success: true,
        data: sales,
        message: "No sales to show"
      });
    } else {
      res.status(200).send({
        success: true,
        data: sales
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


// email voucher
route.patch("/voucheremail/:id", async(req,res)=>{
  const {id} = req.params
  const {email} = req.body
  try {
    const result = await Vouchers.updateOne({
     _id: id,
    },{$push:{
      emailTo: email
      
    }})
    if (result.length === 0) {
      res.status(200).send({
        success: true,
        data: result,
        message: "Flyer updated"
      });
    } else {
      res.status(200).send({
        success: true,
        data: result
      });
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'fa17-bcs-081@cuilahore.edu.pk',
          pass: 'FA17-BCS-081'
        }
      });
      let mailOption={
        from: 'fa17-bcs-081@cuilahore.edu.pk',
        to: email,
        subject: 'form files',
        text:"An Email from will project"
    
    }
      //send email
transporter.sendMail(mailOption,function(err,res){
  if(err){
      console.log("error ",err)
  }
  else{
      console.log("Email sent")
  }
})

    }
    
  } catch (error) {
    res.status(503).send({
      success: false,
      message: "Server error"
    });
  }
})


// delete discounts
route.delete("/delete-discount/:id", async(req,res)=>{
  const {id} = req.params
  try {
    const result = await Discount.deleteOne({_id: id});
    if (result.length === 0) {
      res.status(200).send({
        success: true,
        data: result,
        message: "No Discount Deleted "
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

// edit discounts

route.patch("/editdiscount/:code",async(req,res)=>{
  const {code} = req.params
  
  var update = req.body;
  try {
    const result = await Discount.updateOne({
      discountCode: code
    }, {$set:update})
    if (result.length === 0) {
      res.status(200).send({
        success: true,
        data: result,
        message: "No Discount Updated"
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
