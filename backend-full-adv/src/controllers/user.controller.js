import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js';
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access & refresh tokens")
    }
}

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

const loginUser = asyncHandler(async (req, res) => {

    // req body => data
    // username or email
    // find user`
    // check password
    // access & refresh token
    // send cookies (secure cookie)

    console.log('********************************************req', req)
    const { email, username, password } = req.body;
    console.log('<==================>  username email password', username, email, password)

    if (!(username || email)) {
        throw new ApiError(400, "username or email is required!")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }] //$or => mongodb operator
    });

    if (!user) {
        throw new ApiError(404, "User does not exist!")
    }

    // User mongoose ka object h, mongoose ke methods ko acces kr skte h ispe
    // isPasswordCorrect ko use krne ke liye hmara user use krna pdega i.e "user"

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "user invalid credentials!")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user?._id);

    // send in cookies=>

    const loggedInUser = await User.findById(user?._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    // cookie ka by-default ye nature hota h ki frontend se koi b access kr skta h, ise rokne ke liye httpOnly :true & secure: true kr dete h, fir wo cookies sirf server se modifiable hoti h 

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in successfully!"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                refreshToken: undefined //or null
            }

            // $unset:{
            //      refreshToken:1 //if above fails then use this
            // }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out!"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshAccessToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request!")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token!")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used!")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user?._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken,
                    },
                    "Access token refreshed successfully!"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token!")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword, cnfPassword } = req?.body;

    // if (!(newPassword === cnfPassword)) {
    //     throw new ApiError(400, "New password & confirm password must be same!")
    // }

    const user = await User.findById(req?.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword); // returns true/false

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password!");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password changed successfully!"
            )
        )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "Current user fetched successfully!"
        ));
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req?.body;

    if (!fullName
        //  || !email
    ) {
        throw new ApiError(400, "All fields are required!")
    }

    const user = await User.findByIdAndUpdate(
        req?.user?._id,
        {
            $set: {
                fullName, //agr key nd upcoming key same h to ek hi bar likhne s kam ho jayega es6 syntax
                email: email
            }
        },
        { new: true }// isse update hone ke bad wali information return b ho jati h
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Accont details updated successfully!"
            )
        )
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req?.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Error while uploading avatar!");
    }

    const user = await User.findByIdAndUpdate(
        req?.user?._id,
        {
            $set: {
                avatar: avatar?.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Avatar updated successfully!"
            )
        )
})

const updateUserCoverImage = asyncHandler(async (req, res) => {

    const coverLocalPath = req?.file?.path;

    if (!coverLocalPath) {
        throw new ApiError(400, "Cover Image is missing");
    }

    const cover = await uploadOnCloudinary(coverLocalPath);

    if (!cover) {
        throw new ApiError(400, "Error while uploading cover image!");
    }

    const user = await User.findByIdAndUpdate(
        req?.user?._id,
        {
            $set: {
                coverImage: cover?.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Cover image updated successfully!"
            )
        )
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req?.params;

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing!");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions", //Subscription => gets converted to "subscriptions", bcz db me plural ho jata h & lowercase me ho jata h
                localField: '_id',
                foreignField: "channel",
                as: 'subscribers'
            }
        },
        {
            $lookup: {
                from: "subscriptions", //Subscription => gets converted to "subscriptions", bcz db me plural ho jata h & lowercase me ho jata h
                localField: '_id',
                foreignField: "subcriber",
                as: 'subscribedTo'
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers" //taken from 1st lookup & $ is used bcs it is a field nd iski value leni h hme
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [new mongoose.Types.ObjectId(req?.user?._id), '$subscribers.subscriber'], // in arrays me b dekhta h & objectst me b
                        },
                        then: true,
                        else: false

                    } // iske 3 conditions hote h a. if, b. then, c. else
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ]) // returns arrays [{}]

    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exist");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channel[0],
                "User channel fetched successfully"
            )
        )
})

// lookup ke bad hme array milta h,uski frst value nikalni pdti h always

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req?.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos", //Video => "videos"
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [ // sub pipline (nested pipeline)
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: { // yha pe project krne se ye fayda hoga ki sare fields owner field me hi store hoga. isme jo fields ke aage 1 hoga sirf whi fields present hongi
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    { // ye krne se owner ka format imporve ho jata h, => owner [...] only na ki => owner [{...}]
                        $addFields: {
                            owner: {
                                $first: "$owner",
                                // or $arrayElementsAt :$"owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "Watch history fetched successfully!"
            )
        )
})

export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory }