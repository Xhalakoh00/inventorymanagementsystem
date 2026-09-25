const mongose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};
console.log("databaseConfig.js file is running");

connectDB();
module.exports = connectDB;