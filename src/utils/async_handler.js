const asyncHandler = (requestHandler) => {
  (req ,res , next) => {
    Promise.resolve(requestHandler(req,res,next)).
    catch((err) => next(err))
  }
 
};

export default asyncHandler


// // wrapper func to handle any database connection and async functions (try catch method)
// const asyncHandler = (fn) =>  async(req , res , next) => {
//     try {
//         await fn(req , res , next);
//      } catch (error) {
//         res.status(error.code || 500).json({
//             success : false ,
//             message : error.message
//         })
//     }
//  };
