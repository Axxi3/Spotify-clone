import axios from 'axios';
import { Song, Album, Artist, Radio } from "./Models";


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
  try {
    const { data } = await api.get('/tracks', {
      params: {
        limit: 10,
        order: 'popularity_total',
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
    console.error('Failed to fetch top tracks:', err);
    return [];
  }
};

export const searchSongs = async (query: string, limit: number = 10): Promise<Song[]> => {
  try {
    const { data } = await api.get('/tracks', {
      params: {
        limit,
        namesearch: query,
        include: 'musicinfo',
        audioformat: 'mp31',
      },
    });

    if (!data.results || !Array.isArray(data.results)) return [];

    return data.results.map((track: any): Song => ({
      id: track.id.toString(),
      title: track.name,
      artist: track.artist_name,
      image: track.album_image,
      audioUrl: track.audio,
    }));
  } catch (error) {
    console.error('Jamendo fetch error:', error);
    return [];
  }
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

export const fetchTopAlbums = async (): Promise<Album[]> => {
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
