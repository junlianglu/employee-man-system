import app from "./app.js"
import dotenv from "dotenv"
import mongoDB from "./config/db.js"

dotenv.config();
mongoDB();
app.listen(process.env.PORT || 5001, () => {console.log(`connect server successfully`)});