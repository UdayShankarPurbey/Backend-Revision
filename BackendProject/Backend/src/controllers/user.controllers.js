import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import  { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId);
      const accessToken =  user.generateAccessToken()
      const newRefreshToken = user.generateRefreshToken()
      user.refreshToken = newRefreshToken;
      user.save({validateBeforeSave : false}); 
      return { accessToken, newRefreshToken }
    } catch (error) {
        throw new ApiError(500 , "something  Went Wrong While Generating Access Token and Refresh Token")
    }
}

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
    /*  
    req body -- data
    username or email
    find user
    check if password is correct
    access token and refresh token
    send cookies
     */

    const { email, username , password } = req.body;

    if(!(username || email)) {
        throw new ApiError(400, "Please enter a username or email")
    }
    
    const user = await User.findOne({
        $or : [ {username}, {email}]
    })

    if(!user ) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid User Credentials")
    }

    const { accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select(" -password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken ,options)
    .cookie("refreshToken", refreshToken , options)
    .json(
        new ApiResponse(200 , {
            user : loggedInUser ,
            accessToken,
            refreshToken
        } , "User Logged In Successfully")
    )
})

const logoutUser = asyncHandler( async (req ,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            refreshToken : undefined
        },
        {
            new : true
        }
    )

    const  options = {
        httpOnly : true,
        secure : true
    }

    return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(
        new ApiResponse(200 ,{}, "User Logged Out Successfully")
    )
})

const refreshAccessToken = asyncHandler(async(req, res) => {

    const incomingRefreshToken = req.cookies?.refreshToken || req?.body?.refreshToken

    if( ! incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }
    
        if(incomingRefreshToken != user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is Expired or used") 
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {accessToken , newRefreshToken} = await generateAccessAndRefreshToken(user?._id)
        return res
        .status(200)
        .cookie("accessToken", accessToken ,options)
        .cookie("refreshToken", newRefreshToken , options)
        .json (
            new ApiResponse(200 , {
                user : user ,
                accessToken,
                refreshToken : newRefreshToken
            } , "User Logged In Successfully")
        )
    } catch (error) {
        throw new ApiError( 401 , error?.message || "Invalid Refresh Token")
    }
})

const changeCurrentPassword = asyncHandler( async(req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect) {
        throw new ApiError(401, "Invalid Old Password")
    }

    user.password = newPassword;

    await user.save({validateBeforeSave : false});

    return res
   .status(200)
   .json(
        new ApiResponse(200 , {}, "Password Changed Successfully")
    )
})

const getCurrentUser = asyncHandler(async(req ,res) => {
    return res
   .status(200)
   .json(
        new ApiResponse(200 , req.user , "User Fetched Successfully")
    )
})


const updateAccountDetails = asyncHandler(async(req ,res) => {
    const { email ,fullName } = req.body
    if(!email || !fullName) {
        throw new ApiError(400, "Please fill all the fields")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
       {
            $set : {
                email,
                fullName,
            }
       },
        {
            new : true
        }
    ).select( "-password -refreshToken" )

    return res
   .status(200)
   .json(
        new ApiResponse(200 , user , "Account Details Updated Successfully")
    )
})

//TODO: DELETE avatar image from cloudinary
const updateUserAvatar = asyncHandler(async(req ,res) => { 
    const avatarLocalPath = req.file?.path

    if(! avatarLocalPath ) {
        throw new ApiError(400, "Avatar file is Required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(! avatar?.url) {
        throw new ApiError(500 , "Something went wrong uploading avatar Image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
       {
            $set : {
                avatar : avatar?.url
            }
       },
        {
            new : true
        }
    ).select(" -password -refreshToken")

    return res
   .status(200)
   .json(
        new ApiResponse(200 , user , "Avatar Updated Successfully")
    )
})

//TODO: DELETE cover image from cloudinary
const updateUserCoverImage = asyncHandler(async(req ,res) => {
    const coverImageLocalPath = req.file?.path
    if(! coverImageLocalPath ) {
        throw new ApiError(400, "Cover Image file is Required")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(! coverImage?.url) {
        throw new ApiError(500 , "Something went wrong uploading Cover Image")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
       {
            $set : {
                coverImage : coverImage?.url
            }
       },
        {
            new : true
        }
    ).select(" -password -refreshToken")

    return res
   .status(200)
   .json(
        new ApiResponse(200 , user , "Cover Image Updated Successfully")
    )
})



export { 
    registerUser ,
    loginUser ,
    logoutUser ,
    refreshAccessToken  , 
    changeCurrentPassword ,
    getCurrentUser, 
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}