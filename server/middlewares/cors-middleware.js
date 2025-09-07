const cors = require('cors');

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

const corsOptions = {
origin:function(origin,callback){
    if(!origin) return callback(null,true); //allow server to server or postman
    if(allowedOrigins.includes(origin)){
        return callback(null,true);
    }
    else{
        callback(new Error('CORS policy:origion not allowed'));
    }
},
credentials:true,
methods:['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
allowedHeaders:['Content-Type','Authorization','Accept','Origin','X-Requested-With'],
exposedHeaders:['Content-Range','X-Content-Range']
}

module.exports = cors(corsOptions);