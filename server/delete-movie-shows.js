import 'dotenv/config';
import connectDB from './configs/db.js';
import mongoose from 'mongoose';
import Movie from './models/Movie.js';
import Show from './models/Show.js';

// Configuration: Edit these variables to specify which movie you want to delete
const MOVIE_ID_TO_DELETE = ""; // e.g. "550" (String)
const MOVIE_TITLE_TO_DELETE = "Example Movie Title"; // Used if ID is not provided

async function deleteMovie() {
    try {
        await connectDB();
        
        let targetMovie = null;

        if (MOVIE_ID_TO_DELETE) {
            targetMovie = await Movie.findById(MOVIE_ID_TO_DELETE);
        } else if (MOVIE_TITLE_TO_DELETE) {
            targetMovie = await Movie.findOne({ title: new RegExp(`^${MOVIE_TITLE_TO_DELETE}$`, 'i') });
        }

        if (!targetMovie) {
            console.log("❌ Movie not found in the database.");
            return;
        }

        console.log(`Found movie: "${targetMovie.title}" (ID: ${targetMovie._id})`);

        // 1. Delete associated shows first to avoid orphaned data/crashes
        const showDeleteResult = await Show.deleteMany({ movie: targetMovie._id });
        console.log(`🗑️ Deleted ${showDeleteResult.deletedCount} associated show(s).`);

        // 2. Delete the movie
        await Movie.findByIdAndDelete(targetMovie._id);
        console.log(`🗑️ Deleted movie "${targetMovie.title}" successfully.`);

    } catch (error) {
        console.error("❌ Error deleting movie:", error);
    } finally {
        await mongoose.connection.close();
        console.log("🔌 Database connection closed.");
    }
}

deleteMovie();
