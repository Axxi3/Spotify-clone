import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import { usePlayerStore } from '@/src/constants/services/playerStore';
import { Pause, Play, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Song } from '@/src/constants/services/Models';

const LIKED_SONGS_KEY = 'liked_songs';

const MiniPlayer = () => {
  const { currentTrack, isPlaying, setIsPlaying, sound } = usePlayerStore();
  const router = useRouter();
  
  // Add state for like functionality
  const [isLiked, setIsLiked] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);

  // Load liked songs when component mounts or currentTrack changes
  useEffect(() => {
    loadLikedSongs();
  }, []);

  useEffect(() => {
    if (currentTrack) {
      checkIfSongIsLiked(currentTrack);
    }
  }, [currentTrack, likedSongs]);

  // Load liked songs from AsyncStorage
  const loadLikedSongs = async () => {
    try {
      const stored = await AsyncStorage.getItem(LIKED_SONGS_KEY);
      if (stored) {
        const songs = JSON.parse(stored);
        setLikedSongs(songs);
      }
    } catch (error) {
      console.error('Error loading liked songs:', error);
    }
  };

  // Check if current song is liked
  const checkIfSongIsLiked = (currentSong: Song) => {
    const isCurrentSongLiked = likedSongs.some(song => song.id === currentSong.id);
    setIsLiked(isCurrentSongLiked);
  };

  if (!currentTrack) return null;

  const handleToggle = async (e: any) => {
    e.stopPropagation(); // prevent parent Touchable from triggering
    if (!sound) return;
    
    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const handleOpenPlayer = () => {
    router.push({
      pathname: '/musicplayer',
      params: { songs: encodeURIComponent(JSON.stringify([currentTrack])) },
    });
  };

  // Complete like functionality from music player
  const handleLike = async (e: any) => {
    e.stopPropagation();
    
    if (!currentTrack) return;
    
    try {
      let updatedLikedSongs: Song[];
      
      if (isLiked) {
        // Remove from liked songs
        updatedLikedSongs = likedSongs.filter(song => song.id !== currentTrack.id);
        setIsLiked(false);
        
        // Optional: Show toast instead of alert for mini player
        console.log(`"${currentTrack.title}" removed from liked songs`);
      } else {
        // Add to liked songs
        updatedLikedSongs = [...likedSongs, currentTrack];
        setIsLiked(true);
        
        // Optional: Show toast instead of alert for mini player
        console.log(`"${currentTrack.title}" added to liked songs`);
      }
      
      setLikedSongs(updatedLikedSongs);
      await AsyncStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(updatedLikedSongs));
      
      // Optional: Uncomment if you want alerts in mini player
      // Alert.alert(
      //   isLiked ? 'Removed from Liked Songs' : 'Added to Liked Songs',
      //   isLiked ? `"${currentTrack.title}" removed from your liked songs` : `"${currentTrack.title}" added to your liked songs`,
      //   [{ text: 'OK' }]
      // );
      
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update liked songs');
    }
  };

  return (
    <TouchableOpacity
      onPress={handleOpenPlayer}
      style={[tw`bg-[#282828] mx-2 mb-2 rounded-lg flex-row items-center shadow-lg`, styles.container]}
      activeOpacity={0.8}
    >
      {/* Album Art */}
      <Image 
        source={{ uri: currentTrack.image }} 
        style={tw`w-14 h-14 rounded-lg ml-3 my-3`} 
      />
      
      {/* Song Info */}
      <View style={tw`flex-1 mx-3`}>
        <Text style={tw`text-white font-semibold text-base`} numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text style={tw`text-gray-400 text-sm mt-0.5`} numberOfLines={1}>
          {currentTrack.artist}
        </Text>
      </View>

      {/* Controls */}
      <View style={tw`flex-row items-center mr-3`}>
        {/* Like Button with proper state */}
        <TouchableOpacity 
          onPress={handleLike} 
          style={tw`mr-4`} 
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Heart 
            color={isLiked ? '#1DB954' : 'white'} 
            size={20}
            fill={isLiked ? '#1DB954' : 'transparent'}
          />
        </TouchableOpacity>

        {/* Play/Pause Button */}
        <TouchableOpacity 
          onPress={handleToggle} 
          style={tw`bg-white rounded-full p-2`}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isPlaying ? (
            <Pause color="black" size={20} />
          ) : (
            <Play color="black" size={20} style={tw`ml-0.5`} />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 75, // Adjust based on your tab bar height
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 8, // Android shadow
  },
});

export default MiniPlayer;
