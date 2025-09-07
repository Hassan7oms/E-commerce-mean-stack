// here we initialize the database connection for mongoose database

const mongoose = require('mongoose');
const conectdb = async() =>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database connected successfully");
    }catch(error){
        console.error("Database connection failed", error);
        process.exit(1); // Exit the process with failure
    }
}

module.exports = conectdb;
