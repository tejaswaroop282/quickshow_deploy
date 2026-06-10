import axios from "axios";

const TMDB_BASE = "https://api.themoviedb.org/3";

export const tmdbGet = async (path) => {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const { data } = await axios.get(`${TMDB_BASE}${path}`, {
                headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
                timeout: 20000,
            });
            return data;
        } catch (error) {
            lastError = error;
            console.error(`TMDB request failed (attempt ${attempt}/${maxRetries}):`, error.code || error.message);
            if (attempt < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    throw lastError;
};
