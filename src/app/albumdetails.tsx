import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Heart, Share2, MoreVertical, Play, Pause, Download, Shuffle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tailwind from 'twrnc';
import { getAlbumDetailsById } from '../constants/services/API';
import { Song } from '../constants/services/Models';

const screenWidth = Dimensions.get('window').width;
const LIKED_SONGS_KEY = 'liked_songs';

const albumdetails = () => {
  const { id, image, title } = useLocalSearchParams<{ id: string; image: string; title: string }>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
    
  const handlePress = () => {
    const encodedSongs = encodeURIComponent(JSON.stringify(songs));
    router.push(`/musicplayer?songs=${encodedSongs}`);
  };

  // Load liked songs from AsyncStorage
  const loadLikedSongs = async () => {
    try {
      const stored = await AsyncStorage.getItem(LIKED_SONGS_KEY);
      if (stored) {
        const likedSongsData = JSON.parse(stored);
        setLikedSongs(likedSongsData);
        return likedSongsData;
      }
      return [];
    } catch (error) {
      console.error('Error loading liked songs:', error);
      return [];
    }
  };

  // Check if all songs in the album are liked
  const checkIfAlbumIsLiked = (albumSongs: Song[], likedSongsData: Song[]) => {
    if (albumSongs.length === 0) return false;
    
    return albumSongs.every(albumSong => 
      likedSongsData.some(likedSong => likedSong.id === albumSong.id)
    );
  };

  useEffect(() => {
    const loadAlbum = async () => {
      try {
        const data = await getAlbumDetailsById(id);
        setSongs(data);
        
        // Load liked songs and check if album is liked
        const likedSongsData = await loadLikedSongs();
        const albumIsLiked = checkIfAlbumIsLiked(data, likedSongsData);
        setIsLiked(albumIsLiked);
      } catch (err) {
        console.error('Failed to fetch album:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadAlbum();
    }
  }, [id]);

  // Toggle like for entire album
  const toggleAlbumLike = async () => {
    try {
      let updatedLikedSongs: Song[];
      
      if (isLiked) {
        // Remove all album songs from liked songs
        updatedLikedSongs = likedSongs.filter(likedSong => 
          !songs.some(albumSong => albumSong.id === likedSong.id)
        );
        setIsLiked(false);
        
        Alert.alert(
          'Removed from Liked Songs',
          `All songs from "${title}" have been removed from your liked songs`,
          [{ text: 'OK' }]
        );
      } else {
        // Add all album songs to liked songs (avoid duplicates)
        const newSongs = songs.filter(albumSong => 
          !likedSongs.some(likedSong => likedSong.id === albumSong.id)
        );
        updatedLikedSongs = [...likedSongs, ...newSongs];
        setIsLiked(true);
        
        Alert.alert(
          'Added to Liked Songs',
          `All songs from "${title}" have been added to your liked songs`,
          [{ text: 'OK' }]
        );
      }
      
      setLikedSongs(updatedLikedSongs);
      await AsyncStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(updatedLikedSongs));
      
    } catch (error) {
      console.error('Error toggling album like:', error);
      Alert.alert('Error', 'Failed to update liked songs');
    }
  };

  const PlayButton = () => (
    <TouchableOpacity
      style={tailwind`bg-[#1ed760] w-14 h-14 rounded-full items-center justify-center shadow-lg`}
      onPress={() => setIsPlaying(!isPlaying)}
      activeOpacity={0.8}
    >
      {isPlaying ? (
        <Pause size={22} color="#000" fill="#000" />
      ) : (
        <Play onPress={handlePress} size={22} color="#000" fill="#000" style={tailwind`ml-0.5`} />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={tailwind`flex-1 justify-center items-center bg-[#121212]`}>
        <ActivityIndicator size="large" color="#1ED760" />
      </View>
    );
  }

  if (!songs || songs.length === 0) {
    return (
      <View style={tailwind`flex-1 justify-center items-center bg-[#121212]`}>
        <Text style={tailwind`text-white text-lg`}>No songs found</Text>
      </View>
    );
  }

  return (
    <View style={tailwind`flex-1 bg-[#121212] pt-[35px]`}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <ScrollView style={tailwind`flex-1`} showsVerticalScrollIndicator={false}>
        {/* Album Art Section - Reduced top padding */}
        <View style={tailwind`items-center pt-4 px-5`}>
          <Image
            source={{ uri: image }}
            style={[
              tailwind`rounded-lg shadow-2xl`, 
              { 
                width: screenWidth - 80, 
                height: screenWidth - 80,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
              }
            ]}
            resizeMode="cover"
          />
        </View>

        {/* Album Info Section - Reduced padding */}
        <View style={tailwind`px-5 pt-4`}>
          <Text style={tailwind`text-white text-[19px] font-bold mb-1`} numberOfLines={2}>
            {title}
          </Text>

          <View style={tailwind`flex-row items-center mb-2`}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face',
              }}
              style={tailwind`w-5 h-5 rounded-full mr-2`}
            />
            <Text style={tailwind`text-[#b3b3b3] font-medium text-sm`}>Jamendo Artist</Text>
          </View>

          <Text style={tailwind`text-[#a7a7a7] text-xs mb-4`}>
            Album • 2025 • {songs.length} songs
          </Text>

          {/* Controls Section - Better spacing */}
          <View style={tailwind`flex-row items-center justify-between mb-6`}>
            <View style={tailwind`flex-row items-center`}>
              <TouchableOpacity onPress={toggleAlbumLike} activeOpacity={0.7}>
                <Heart
                  size={26}
                  color={isLiked ? '#1ed760' : '#b3b3b3'}
                  fill={isLiked ? '#1ed760' : 'transparent'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={tailwind`ml-6`} activeOpacity={0.7}>
                <Download size={24} color="#b3b3b3" />
              </TouchableOpacity>
              <TouchableOpacity style={tailwind`ml-6`} activeOpacity={0.7}>
                <MoreVertical size={24} color="#b3b3b3" />
              </TouchableOpacity>
            </View>
            
            <View style={tailwind`flex-row items-center`}>
              <TouchableOpacity style={tailwind`mr-4`} activeOpacity={0.7}>
                <Shuffle size={22} color="#b3b3b3" />
              </TouchableOpacity>
              <PlayButton />
            </View>
          </View>
        </View>

        {/* Songs List - Improved spacing and layout */}
        <View style={tailwind`px-5 pb-24`}>
          <View style={tailwind`flex-row items-center mb-4`}>
            <Text style={tailwind`text-[#b3b3b3] text-xs font-medium flex-1`}>#</Text>
            <Text style={tailwind`text-[#b3b3b3] text-xs font-medium flex-1 ml-4`}>TITLE</Text>
            <View style={tailwind`w-6`} />
          </View>

          {songs.map((song, index) => (
            <Pressable
              key={song.id}
              style={tailwind`flex-row items-center py-2.5 ${index === 0 ? 'bg-[#1a1a1a]' : ''} rounded-md px-2 -mx-2`}
              onPress={handlePress}
            >
              <Text style={tailwind`text-[#b3b3b3] text-sm w-6 text-center ${index === 0 ? 'text-[#1ed760]' : ''}`}>
                {index + 1}
              </Text>
              
              <Image 
                source={{ uri: song.image }} 
                style={tailwind`w-10 h-10 rounded ml-4 mr-3`} 
              />
              
              <View style={tailwind`flex-1 mr-3`}>
                <Text 
                  style={tailwind`text-white font-medium text-sm mb-0.5 ${index === 0 ? 'text-[#1ed760]' : ''}`} 
                  numberOfLines={1}
                >
                  {song.title}
                </Text>
                <Text style={tailwind`text-[#b3b3b3] text-xs`} numberOfLines={1}>
                  {song.artist}
                </Text>
              </View>
              
              <TouchableOpacity activeOpacity={0.7}>
                <MoreVertical size={18} color="#b3b3b3" />
              </TouchableOpacity>
            </Pressable>
          ))}

          {/* Footer - More compact */}
          <View style={tailwind`mt-6 pt-4 border-t border-[#282828]`}>
            <Text style={tailwind`text-[#6a6a6a] text-xs mb-0.5`}>© 2025 Jamendo Music</Text>
            <Text style={tailwind`text-[#6a6a6a] text-xs`}>All rights reserved.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default albumdetails;