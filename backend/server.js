import 'dotenv/config';
import app from "./app.js";
import mongoDB from "./config/db.js";

//dotenv.config();
mongoDB();
app.listen(process.env.PORT || 5001, () => {console.log(`connect server successfully`)});