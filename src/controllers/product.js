const Product = require("../models/product")

exports.createProduct = async(req,res)=>{
    try{
        const{title,description,price,currencyId,currencyFormat,isFreeShipping,style,availableSizes,installments,deletedAt,isDeleted} = req.body;

        if(!req.files["productImage"]){
            return res.status(400).json({status:false,message:"product image is missing."})
        }
        const productImageFileLocation = req.files["productImage"][0].location;

        const product = await Product.create({
            title,
            description,
            price,
            currencyId,
            currencyFormat,
            isFreeShipping,
            productImage:productImageFileLocation,
            style,
            availableSizes,
            installments,
            deletedAt,
            isDeleted
        })

        return res.status(200).json({status:true,message:"product created successfully",data:product})
    }
    catch(error){
        console.log(error.message)
        return res.status(500).json({status:false,message:"internal server error"})
    }
}



//get product
exports.getProduct = async (req, res) => {
    try {
        const { size, name, priceGreaterThan, priceLessThan, priceSort } = req.query; //we use query for filter 

        // Build the query dynamically based on the provided parameters
// isDeleted:false mtlb jo data hmare pas h usi m bs filter lgana h and usi data ko bs fetch krna h , deleted data ko fetch nii krna h 
// means jo data k isdeleted:false h sirf whi av delete nii hua h and use hi hme fetch krna h .
// jis data k isdelted:true h vo data already delete ho chuka h 
        const query = {isDeleted:false};    
        if (name) {
            query.title = { $regex: new RegExp(name, 'i') }; // Case-insensitive substring match
        }
        if (priceGreaterThan || priceLessThan) {
            query.price = {};
            if (priceGreaterThan) {
                query.price.$gt = parseFloat(priceGreaterThan);
            }
            if (priceLessThan) {
                query.price.$lt = parseFloat(priceLessThan);
            }
        }
        if (size) {
            query.availableSizes = size;
        }

        // Build the sort options dynamically
        const sortOption = {};
        if (priceSort) {
            sortOption.price = parseInt(priceSort);
        }

        // Fetch products based on the constructed query and sort options
        const products = await Product.find(query).sort(sortOption);

        // const products = await Product.find().sort({price:-1});

        return res.status(200).json({ status: true, message: "Products fetched successfully", data: products });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
};


// update product
exports.updateProduct = async(req,res)=>{
    try{

        if(!req.files["productImage"]){
            return res.status(422).json({status:false,message:"product image is missing."})
        }
        const productImageFileLocation = req.files["productImage"][0].location;

        const {id} = req.params
        const{title,description,price,currencyId,currencyFormat,isFreeShipping,style,
        availableSizes,installments} = req.body

        const existingProduct = await Product.findOneAndUpdate({
            _id:id
        },{
            title,
            description,
            price,
            currencyId,
            currencyFormat,
            isFreeShipping,
            style,
            availableSizes,
            installments,
            productImage:productImageFileLocation
        },{
            new:true
        })

        return res.status(200).json({status:true,message:"product updated successfully",data:existingProduct})
        }
    
    catch(error){
        console.log(error.message);
        return res.status(500).json({status:false,message:"internal server error"})
    }
}


// delete product 
// findOneAndUpdate and isDeleted:true is used for temporary delete of data.
// findOneAndDelete is used for permanent delete of data.
exports.deleteProduct = async(req,res)=>{
    try{
        const{id} = req.params;

        // const softDelete = await Admin.findOneAndDelete(
        const softDelete = await Product.findOneAndUpdate(
            {_id:id},
            {$set:{isDeleted:true}},
            {new:true}
        )
        if(!softDelete){
            return res.status(404).json({status:false,message:"product not found"})
        }
        // console.log(softDelete);
        return res.status(200).json({status:true,message:"product temporarily deleted successfully",data:softDelete})
    }
    catch(error){
        console.log(error.message)
        return res.status(500).json({status:false,message:"internal server error"})
    }
}


// get product by id
exports.getProductById = async(req,res)=>{
    try{
        const {id} = req.params
        const get = await Product.findOne({
            _id:id
        })

        return res.status(200).json({status:true, message:"product fetched",data :get})
    }
    catch(error){
        console.log(error.message)
        return res.status(500).json({status:false,message:"internal server error"})
    }
}