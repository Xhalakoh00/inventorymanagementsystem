const express = require('express');
const dotenv = require('dotenv');

const app = express();
const productRoute = require('./Routes/ProductRoute');
const userRoute = require('./Routes/UserRoute');
const saleRoute = require('./Routes/SalesRoute'); // <-- ADD THIS
const cors = require('cors');
app.use(cors()); // enable CORS for all routes

dotenv.config(); // load environment variables from .env file

app.use(express.json()); // middleware to parse JSON request bodies

app.use('/products', productRoute); // use the product route for all requests starting with /products
app.use('/users', userRoute); // use the user route for all requests starting with /users
app.use('/sales', saleRoute); // use the sales route for all requests starting with /sales
const connectDB = require('./Config/databaseConfig');
connectDB(); // connect to MongoDB

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
