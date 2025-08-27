import mysql from 'mysql2/promise';

export const connectDb = async () => {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'job'
        });
        // console.log("Database connected...");
        return connection;
    } catch (err) {
        console.error("Failed to connect to the database:", err.message);
        throw err;
    }
};