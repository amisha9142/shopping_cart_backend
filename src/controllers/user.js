const User = require('../models/user'); // Import your User model
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validateEmail ,validatePassword, validatePhone} = require('../utilis/validation');

// create user
exports.createUser = async (req, res) => {
    try {
        const { fname, lname, email, phone, password , role} = req.body;
        
        // aws create profileimage
        if(!req.files["profileImage"]){
            return res.status(400).json({status:false,message:"profile image file is missing."})
        }
        const profileImageFileLocation  = req.files["profileImage"][0].location

        // validation
        if(!email){
            return res.status(422).json({status:false,message:"email is required"})
        }
        if(!password){
            return res.status(422).json({status:false,message:"password is required"})
        }
        if(!phone){
            return res.status(422).json({status:false,message:"phone no is required"})
        }
        // if(!address){
        //     return res.status(422).json({status:false,message:"address is required"})
        // }
        if(!fname){
            return res.status(422).json({status:false,message:"fname is required"})
        }
        if(!lname){
            return res.status(422).json({status:false,message:"lname is required"})
        }



        // email validation
        const existingEmail = await User.findOne({
            email:email
        })
        if(existingEmail){
            return res.status(400).json({status:false,message:"email already exist"})
        }

        // phone validation
        const phoneNo = await User.findOne({
            phone:phone
        })
        if(phoneNo){
            return res.status(400).json({status:false,message:"phone no already exist"})
        }

        // validate email
        if(!validateEmail(email)){
            return res.status(400).json({status:false,message:"email must contain character,digit and special character."})
        }

        // validate password
        if(!validatePassword(password)){
            return res.status(400).json({staus:false,message:"password must contain uppercase and lowercase , digit and a special character "})
        }

        //validate phone
        if(!validatePhone(phone)){
            return res.status(400).json({status:false,message:"phone no is not valid"})
        }

        const bcryptPassword = await bcrypt.hash(password,10);
        // const {shipping,billing} = address
  
        // Create a new user object
        const newUser = await User.create({
            fname,
            lname,
            email,
            phone,
            password:bcryptPassword, // Make sure to hash the password before saving it to the database
            // address: {
            //     shipping: {
            //         street:shipping.street,
            //         city:shipping.city,
            //         pincode:shipping.pincode,
            //     },
            //     billing: {
            //         street:billing.street,
            //         city:billing.city,
            //         pincode:billing.pincode,
            //     },
            // },
            profileImage:profileImageFileLocation,
            role
        })

            return res.status(200).send({
                status:true,
                message:"data created successfully",
                data:newUser
        })
    } 
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
};


// login api
exports.login = async(req,res)=>{
    try{
        const{email,password} = req.body
        if(!email){
            return res.status(422).json({status:false,message:"email is required"})
        }
        if(!password){
            return res.status(422).json({status:false,message:"password is required"})
        }

        // email validation
        const existingEmail = await User.findOne({
            email:email
        })
        if(!existingEmail){
            return res.status(400).json({status:false,message:"invalid email id or password"})
        }

        // password validation
        const validatePassword = await bcrypt.compare(password,existingEmail.password)
        if(!validatePassword){
            return res.status(400).json({status:false,message:"invalid email id or password"})
        }

        // token generator 
        const token = jwt.sign({userId:existingEmail._id},process.env.JWT_SECRET,{
            expiresIn : "9d"  // 9 days
        })
        return res.status(200).json({status:true,message:"user login successfully",token,data:existingEmail})
    }
    catch(error){
        console.log(error.message)
        return res.status(500).json({status:false,message:"internal servor error"})
    }
}

// get all users
exports.getUser = async(req,res)=>{
    try{
        const person = await User.find()
        if(User.length === 0 ){
            return res.status(422).json({status:"false",message:"no user found"})
        }
        return res.status(200).json({status:true,data:person})
    }
    catch(error){
        console.log(error.message)
        return res.status(500).json({status:false,message:"internal server error"})
    }
}


//update user data
exports.updateUser = async (req, res) => {
    try {
        if(!req.files["profileImage"]){
            return res.status(400).json({status:false,message:"profile image file is missing."})
        }
        const profileImageFileLocation  = req.files["profileImage"][0].location

        const { id } = req.params;
        const { fname, lname, email, phone, password } = req.body;

        // Check if the user with the specified ID exists
        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        // Update user information
        existingUser.fname = fname;
        existingUser.lname = lname;
        existingUser.email = email;
        existingUser.phone = phone;
        existingUser.password = password;
        existingUser.profileImage = profileImageFileLocation;

        // Save the updated user
        const updatedUser = await existingUser.save();

        return res.status(200).json({ status: true, message: "Data updated successfully", data: updatedUser });
    }
// }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
};




















































































                        //    or 

        // const newUser = new User({
        //     fname,
        //     lname,
        //     email,
        //     phone,
        //     password, // Make sure to hash the password before saving it to the database
        //     address: {
        //         shipping: {
        //             street:shipping.street,
        //             city:shipping.city,
        //             pincode:shipping.pincode,
        //         },
        //         billing: {
        //             street:billing.street,
        //             city:billing.city,
        //             pincode:billing.pincode,
        //         },
        //     },
        // });

        // Save the new user to the database
//         await newUser.save();

//         return res.status(201).json({ status: true, message: 'User created successfully' });
   
