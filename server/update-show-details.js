import 'dotenv/config';
import connectDB from './configs/db.js';
import mongoose from 'mongoose';
import Show from './models/Show.js';
import Movie from './models/Movie.js';

// Configuration: Edit these variables to specify the show and target updates
const SHOW_ID_TO_UPDATE = ""; // e.g. "65d8a2..." (Mongoose ObjectId as string)

// Or update shows for a specific movie if SHOW_ID_TO_UPDATE is empty
const MOVIE_TITLE = "Example Movie Title"; 

// Update fields (leave null/undefined if you don't want to change them)
const NEW_PRICE = 350; // e.g., Number price
const NEW_DATETIME = "2026-07-05T18:30:00.000Z"; // e.g., ISO string (UTC) or Date object

async function updateShowDetails() {
    try {
        await connectDB();

        let showsToUpdate = [];

        if (SHOW_ID_TO_UPDATE) {
            const show = await Show.findById(SHOW_ID_TO_UPDATE);
            if (show) showsToUpdate.push(show);
        } else if (MOVIE_TITLE) {
            const movie = await Movie.findOne({ title: new RegExp(`^${MOVIE_TITLE}$`, 'i') });
            if (movie) {
                showsToUpdate = await Show.find({ movie: movie._id });
                console.log(`Found ${showsToUpdate.length} shows for movie: "${movie.title}"`);
            } else {
                console.log("❌ Movie not found.");
            }
        }

        if (showsToUpdate.length === 0) {
            console.log("❌ No shows found to update.");
            return;
        }

        for (const show of showsToUpdate) {
            console.log(`\nUpdating Show ID: ${show._id}`);
            
            if (NEW_PRICE !== undefined && NEW_PRICE !== null) {
                console.log(`  Updating Price: ${show.showPrice} ➡️ ${NEW_PRICE}`);
                show.showPrice = NEW_PRICE;
            }

            if (NEW_DATETIME) {
                const targetDate = new Date(NEW_DATETIME);
                console.log(`  Updating Show Time: ${show.showDateTime} ➡️ ${targetDate}`);
                show.showDateTime = targetDate;
            }

            await show.save();
            console.log(`✅ Show ${show._id} updated successfully.`);
        }

    } catch (error) {
        console.error("❌ Error updating show:", error);
    } finally {
        await mongoose.connection.close();
        console.log("🔌 Database connection closed.");
    }
}

updateShowDetails();
