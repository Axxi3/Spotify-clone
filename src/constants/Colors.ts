const spotifyGreen = '#1DB954';
const spotifyBlack = '#121212'; // Spotify uses this rich black tone
const spotifyGray = '#B3B3B3';   // Common for inactive icons/text

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: spotifyGreen,
    tabIconDefault: spotifyGray,
    tabIconSelected: spotifyGreen,
  },
  dark: {
    text: '#fff',
    background: spotifyBlack,
    tint: spotifyGreen,
    tabIconDefault: spotifyGray,
    tabIconSelected: spotifyGreen,
  },
};
