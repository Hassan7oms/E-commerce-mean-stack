const logger = require('../utils/logger.utils')
module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';


  
 logger.error(`Error occured [ ${req.method} ${req.origionalUrl} | ${err.message} | stack: ${err.stack}
   | user ${req.user?.id}
    ]`)
    if(process.env.NODE_ENV === 'development'){
        
        return res.status(err.statusCode).json({
            status:err.status,
            error:err,
            message:err.message,
            stack:err.stack
        })
    }
 
         return res.status(err.statusCode).json({
            status:err.status,
            message:err.message,
        });
    //     if(process.env.NODE_ENV === 'production'){
    //         if(err.isOperational){
    //     return res.status(err.statusCode).json({
    //         status:err.status,
    //         message:err.message,
    //     })
    // }
    // }
}