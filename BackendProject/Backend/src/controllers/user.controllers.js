import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import  { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req ,res) => {
    /*
    get User Details from Frontend 
    validation -- not empty
    check if user exists
    check for images 
    check for avatar
    upload image on cloudinary - avatar & coverImage
    create user object  -- create entry in db
    remove password and refresh token files from response
    check for user creation 
    return response
    */
   const { username , email , fullName , password } = req.body;

   if(
    [ fullName , email , password , username ].some((fields) => fields?.trim() === "")
   ) {
    throw new ApiError(400, "Please fill all the fields")
   }

   const existedUser = await User.findOne({
    $or : [ {username}, {email}]
   })

   if(existedUser) {
    throw new ApiError(409, "User already exists")
   }

   const avatarLocalPath = req.files?.avatar[0]?.path

   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files?.coverImage[0].path
   }

   if(! avatarLocalPath ) {
    throw new ApiError(400, "Avatar file is Required")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

   if(! avatar) {
    throw new ApiError(500 , "Something went wrong uploading avatar Image")
   }

   const user =await User.create({
    username,
    email,
    fullName,
    avatar : avatar?.url,
    coverImage : coverImage?.url || '',
    password,
   })

   const createdUser = await User.findById(user._id).select('-password -refreshToken')

   if(! createdUser) {
    throw new ApiError(500, "Internal Server Error Try Again")
   }

   return res.status(201).json(
    new ApiResponse(200 , createdUser , "User Registered Successfully")
   )


    
})

const loginUser = asyncHandler( async (req ,res) => { 

})

export { registerUser }