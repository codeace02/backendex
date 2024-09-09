import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js';
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {

    // get user details from frontend
    // validation check
    // check for existing user => via username & email
    // check for images, check for avatar
    // upload them to cloudinary, avatar check
    // create user object bcoz mongodb is a nosql db => create entry in db
    // remove password & refresh token field from response
    // check for user creation
    // return response 

    const { fullName, email, username, password } = req.body
    console.log('<============================================================================fullName email :', fullName, email);

    if (
        [fullName, email, password, username].some(item => item?.trim() === "")
    ) {
        throw new ApiError(400, `All fields are required`);
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username is already registered")
    }

    // for extracting files => we can use req.files, multer gives this access to extract it from req directly . as we've already used middleware for file in user.routes  upload.fields([{name: 'avatar', maxCount: 1},{ name: 'coverImage', maxCount: 1 }]),

    const avatarLocalPath = (req?.files && Array.isArray(req?.files?.avatar) && req?.files?.avatar?.length) ? req?.files?.avatar[0]?.path : null;
    const coverImageLocalPath = (req?.files && Array.isArray(req?.files?.coverImage)) ? req?.files?.coverImage?.path : null;

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar file is required')
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, 'Avatar file is required')
    }

    const user = await User.create({
        fullName,
        avatar: avatar?.url,
        coverImage: coverImage?.url || '',
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser1 = await User.findById(user?._id)
    console.log('createdUser1', createdUser1)

    const createdUser = await User.findById(user?._id).select(
        "-password -refreshToken"
    );  // yha pe string me -ve sign ke sath jo b likhenge use remove kr dega

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user!")
    }

    console.log('createdUser', createdUser);

    return res.status(201).json(
        new ApiResponse(200, createdUser, 'User registered successfully!')
    )

})

export { registerUser }