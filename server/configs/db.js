import mongoose from 'mongoose';

const connectDB = async () =>{
    try {
        mongoose.connection.on('connected', ()=> console.log('Database connected'));
        const baseUri = process.env.MONGODB_URI.replace(/\/$/, '');
        const uri = baseUri.includes('?') || /\/[a-zA-Z0-9_-]+$/.test(baseUri)
            ? process.env.MONGODB_URI
            : `${baseUri}/quickshow`;
        await mongoose.connect(uri);
    } catch (error) {
        console.log(error.message);
        
    }
}

export default connectDB;