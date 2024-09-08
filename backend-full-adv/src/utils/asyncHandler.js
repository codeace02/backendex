// with promise format====>

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise
            .resolve(requestHandler(req, res, next))
            .catch((err) => next(err))
    }
}

export { asyncHandler }


// const asyncHandler=()=>{}
// const asyncHandler=(function)=>()=>{}
// const asyncHandler=(function)=>async ()=>{}


// with try catch format
// const asyncHandler2 = (fn) => async (err, req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }
