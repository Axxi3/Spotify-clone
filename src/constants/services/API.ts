import axios from 'axios';
import { Song, Album, Artist, Radio } from "./Models";
import { CUTE_SONGS, MOCK_TRACKS, POP_SONGS, ROCK_SONGS, ROMANTIC_SONGS } from './Mockdata';


const JAMENDO_API = 'https://api.jamendo.com/v3.0';
const CLIENT_ID = '4d670c84'; // Replace with your Jamendo client ID

const api = axios.create({
  baseURL: JAMENDO_API,
  params: {
    client_id: CLIENT_ID,
    format: 'json',
  }, 
});

export const fetchTopTracks = async (): Promise<Song[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_TRACKS);
    }, 300); // simulate slight network delay
  });
};

// API for Pop Songs
export const fetchPopSongs = async (): Promise<Song[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(POP_SONGS);
    }, 300); // simulate slight network delay
  });
};

// API for Rock Songs
export const fetchRockSongs = async (): Promise<Song[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ROCK_SONGS);
    }, 300); // simulate slight network delay
  });
};

// API for Romantic Songs
export const fetchRomanticSongs = async (): Promise<Song[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ROMANTIC_SONGS);
    }, 300); // simulate slight network delay
  });
};

// API for Cute Songs
export const fetchCuteSongs = async (): Promise<Song[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(CUTE_SONGS);
    }, 300); // simulate slight network delay
  });
};

export const searchSongs = async (query: string): Promise<Song[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Get all songs with unique IDs
      const allSongs = [
        ...MOCK_TRACKS.map(song => ({ ...song, id: `track_${song.id}` })),
        ...POP_SONGS.map(song => ({ ...song, id: `pop_${song.id}` })),
        ...ROCK_SONGS.map(song => ({ ...song, id: `rock_${song.id}` })),
        ...ROMANTIC_SONGS.map(song => ({ ...song, id: `romantic_${song.id}` })),
        ...CUTE_SONGS.map(song => ({ ...song, id: `cute_${song.id}` })),
      ];

      // If no query provided, return all songs
      if (!query || query.trim() === '') {
        resolve(allSongs);
        return;
      }

      // Filter songs based on query with null checks
      const filteredSongs = allSongs.filter(song => {
        const title = song.title?.toLowerCase() || '';
        const artist = song.artist?.toLowerCase() || '';
        const album = song.album?.toLowerCase() || '';
        const searchQuery = query.toLowerCase();
        
        return title.includes(searchQuery) ||
               artist.includes(searchQuery) ||
               album.includes(searchQuery);
      });

      resolve(filteredSongs);
    }, 300);
  });
};


export const fetchHorrorSongs = async (): Promise<Song[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_TRACKS].reverse()); // Reverse for different order
    }, 300);
  });
};

export const fetchCountrySongs = async (): Promise<Song[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...POP_SONGS].reverse());
    }, 300);
  });
};

export const fetchReggaeSongs = async (): Promise<Song[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...ROCK_SONGS].reverse());
    }, 300);
  });
};

export const fetchBluesSongs = async (): Promise<Song[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...ROMANTIC_SONGS].reverse());
    }, 300);
  });
};

export const fetchFolkSongs = async (): Promise<Song[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...CUTE_SONGS].reverse());
    }, 300);
  });
};

export const fetchTracksByGenre = async (genre: string): Promise<Song[]> => {
  try {
    const { data } = await api.get('/tracks', {
      params: {
        limit: 10,
        order: 'popularity_total',
        tags: genre,
      },
    });

    if (!data.results || data.results.length === 0) return [];

    return data.results.map((track: any): Song => ({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      image: track.album_image || track.image || 'https://via.placeholder.com/300?text=No+Image',
      audioUrl: track.audio,
    }));
  } catch (err) {
    console.error(`Failed to fetch tracks for genre: ${genre}`, err);
    return [];
  }
};

export const  fetchTopAlbums = async (): Promise<Album[]> => {
  try {
    const { data } = await api.get('/albums', {
      params: {
        limit: 10,
        order: 'popularity_total',
      },
    });

    if (!data.results || data.results.length === 0) return [];

    return data.results.map((album: any): Album => ({
      id: album.id,
      title: album.name,
      artist: album.artist_name,
      image: album.image || 'https://via.placeholder.com/300?text=No+Image',
      releaseDate: album.releasedate,
      zipUrl: album.zip,
      shareUrl: album.shareurl,
    }));
  } catch (err) {
    console.error('Failed to fetch albums:', err);
    return [];
  }
};

export const fetchTopArtists = async (): Promise<Artist[]> => {
  try {
    const { data } = await api.get('/artists', {
      params: {
        limit: 10,
        order: 'popularity_total',
      },
    });

    if (!data.results || data.results.length === 0) return [];

    return data.results.map((artist: any): Artist => ({
      id: artist.id,
      name: artist.name,
      joinDate: artist.joindate,
      profileUrl: artist.shareurl,
      image: artist.image && artist.image.trim() !== ''
        ? artist.image
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=0D8ABC&color=fff&size=256`,
    }));
  } catch (err) {
    console.error('Failed to fetch artists:', err);
    return [];
  }
};

// export const fetchRadios = async (): Promise<Radio[]> => {
//   try {
//     const { data } = await api.get('/radios', {
//       params: {
//         limit: 25,
//       },
//     });

//     if (data?.headers?.status === 'success') {
//       return data.results.map((radio: any): Radio => ({
//         id: radio.id.toString(),
//         name: radio.name,
//         displayName: radio.dispname,
//         image: radio.image,
//         type: radio.type,
//         streamUrl: `https://streaming.jamendo.com/${radio.name}`,
//       }));
//     }

//     return [];
//   } catch (error) {
//     console.error('Error fetching radios:', error);
//     return [];
//   }
// };

export const getAlbumDetailsById = async (albumId: string): Promise<Song[]> => {
  try {
    const { data } = await api.get('/tracks', {
      params: {
        album_id: albumId,
      },
    });

    return data.results.map((track: any): Song => ({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      image: track.album_image,
      audioUrl: track.audio,
    }));
  } catch (error) {
    console.error("Error fetching songs by album:", error);
    return [];
  }
};
