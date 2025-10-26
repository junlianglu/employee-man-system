import mongoose from "mongoose";
const mongoDB = async () => {
    try{
        const connObj = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`OK, mongoDB connect successfully: ${connObj.connection.host}`);
    }
    catch(err){
        console.error(`Error, connect to mongoDB fail: ${err.message}`)
        process.exit(1);
    }
};
export default mongoDB;