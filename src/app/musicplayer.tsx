import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Plus,
  Shuffle,
  Clock,
  Share,
  Menu,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react-native';

import { Song } from '@/src/constants/services/Models';
import { usePlayerStore } from '../constants/services/playerStore';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const LIKED_SONGS_KEY = 'liked_songs';

export default function SpotifyMusicPlayer() {
  // IMPORTANT: Move router to the top with other hooks
  const router = useRouter();
  
  const {
    currentTrack,
    setTrack,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    sound,
    setSound,
  } = usePlayerStore();

  const { songs } = useLocalSearchParams();

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);

  let tracks: Song[] = [];
  try {
    tracks = JSON.parse(decodeURIComponent(songs as string));
  } catch (e) {
    console.error('Invalid song data', e);
  }

  const track = tracks[currentTrackIndex];

  useEffect(() => {
    const setup = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      await loadLikedSongs();
      if (track?.audioUrl) {
        await loadAudio(track.audioUrl);
      }
    };

    setup();
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  // Fixed: Added dependency on currentTrackIndex to handle track changes
  useEffect(() => {
    if (track) {
      setTrack(track);
      checkIfSongIsLiked(track);
      
      // Load new audio when track index changes (but not on initial load)
      if (!isInitialLoading && track.audioUrl) {
        loadAudio(track.audioUrl);
      }
    }
  }, [currentTrackIndex, likedSongs]);

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

  // Toggle like status
  const toggleLike = async () => {
    try {
      let updatedLikedSongs: Song[];
      
      if (isLiked) {
        updatedLikedSongs = likedSongs.filter(song => song.id !== track.id);
        setIsLiked(false);
      } else {
        updatedLikedSongs = [...likedSongs, track];
        setIsLiked(true);
      }
      
      setLikedSongs(updatedLikedSongs);
      await AsyncStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(updatedLikedSongs));
      
      Alert.alert(
        isLiked ? 'Removed from Liked Songs' : 'Added to Liked Songs',
        isLiked ? `"${track.title}" removed from your liked songs` : `"${track.title}" added to your liked songs`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update liked songs');
    }
  };

  const loadAudio = async (uri: string) => {
    try {
      setIsLoading(true); // Show loading when switching tracks
      
      // Unload previous sound
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // Reset audio state
      setCurrentTime(0);
      setDuration(0);

      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }, // Auto-play the new track
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
        setIsPlaying(true);
      }
      
    } catch (error) {
      console.error('Audio load error', error);
      Alert.alert('Error', 'Failed to load audio track');
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        handleTrackEnd();
      }
    }
  };

  // Fixed and improved handleClose function
  const handleClose = () => {
    console.log('Closing music player...'); // Debug log
    console.log('Router canGoBack:', router.canGoBack?.());
    
    try {
      // Check if we can go back
      if (router.canGoBack && router.canGoBack()) {
        console.log('Going back...');
        router.back();
      } else {
        console.log('Cannot go back, navigating to home...');
        // Navigate to your main tab route - adjust this path as needed
        router.push('/(tabs)');
      }
    } catch (error) {
      console.error('Error closing player:', error);
      // Ultimate fallback - force navigation to main screen
      try {
        router.replace('/(tabs)');
      } catch (fallbackError) {
        console.error('Fallback navigation failed:', fallbackError);
        // If all else fails, dismiss the modal (if it's presented as modal)
        router.dismiss?.();
      }
    }
  };

  const handleTrackEnd = () => {
    if (currentTrackIndex < tracks.length - 1) {
      skipToNext();
    } else {
      // Loop back to first track or stop
      setCurrentTrackIndex(0);
      setIsPlaying(false);
    }
  };

  const togglePlayPause = async () => {
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
      console.error('Error toggling play/pause:', error);
    }
  };

  // Fixed: Simplified skip functions
  const skipToNext = () => {
    if (tracks.length > 1) {
      const nextIndex = (currentTrackIndex + 1) % tracks.length;
      setCurrentTrackIndex(nextIndex);
    }
  };

  const skipToPrevious = () => {
    if (tracks.length > 1) {
      const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
      setCurrentTrackIndex(prevIndex);
    }
  };

  const formatTime = (millis: number) => {
    const totalSecs = Math.floor(millis / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Show loading screen only during initial load
  if (isInitialLoading) {
    return (
      <View style={tw`flex-1 bg-black items-center justify-center`}>
        <ActivityIndicator size="large" color="white" />
        <Text style={tw`text-white mt-4`}>Loading...</Text>
      </View>
    );
  }

  // Handle case where no track is available
  if (!track) {
    return (
      <View style={tw`flex-1 bg-black items-center justify-center`}>
        <Text style={tw`text-white text-lg`}>No track available</Text>
        <TouchableOpacity 
          onPress={handleClose}
          style={tw`mt-4 bg-green-500 px-6 py-3 rounded-full`}
        >
          <Text style={tw`text-black font-bold`}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaProvider style={tw`flex-1 bg-black pt-[20px]`}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={tw`flex-row items-center justify-between px-6 pt-3 pb-4`}>
        <TouchableOpacity 
          onPress={handleClose}
          style={tw`p-2 -ml-2`} // Negative margin to maintain visual alignment
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }} // Increase touch area
          activeOpacity={0.7}
        >
          <ChevronDown size={28} color="white" />
        </TouchableOpacity>
        <View style={tw`items-center flex-1`}>
          <Text style={tw`text-gray-400 text-xs font-medium tracking-wide`}>
            PLAYING {`${currentTrackIndex + 1}`} OF {tracks.length}
          </Text>
          <Text style={tw`text-white text-sm font-medium`} numberOfLines={1}>
            {track.title || 'Unknown Album'}
          </Text>
        </View>
        <TouchableOpacity style={tw`p-2 -mr-2`}>
          <MoreHorizontal size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
        <View style={tw`mx-6 mb-8`}>
          <View style={tw`bg-white rounded-lg p-6 shadow-lg`}>
            <View style={tw`items-center mb-4`}>
              <Text style={tw`text-black text-lg font-bold mb-1`} numberOfLines={2}>
                {track.title.toUpperCase()}
              </Text>
              <Text style={tw`text-gray-600 text-sm font-medium tracking-wide`} numberOfLines={1}>
                {track.album || 'Unknown Album'}
              </Text>
            </View>

            <Image
              source={{ uri: track.image }}
              style={tw`w-full h-64 rounded-lg mb-4`}
              resizeMode="cover"
            />

            <View style={tw`items-end`}>
              <Text style={tw`text-black text-sm font-medium`} numberOfLines={1}>
                {track.artist.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={tw`px-6 mb-8`}>
          <View style={tw`flex-row items-center justify-between mb-4`}>
            <View style={tw`flex-1`}>
              <Text style={tw`text-white text-xl font-bold mb-1`} numberOfLines={1}>
                {track.title}
              </Text>
              <View style={tw`flex-row items-center`}>
                <View style={tw`w-3 h-3 bg-green-500 rounded-full mr-2`} />
                <Text style={tw`text-gray-300 text-base`} numberOfLines={1}>
                  {track.artist}
                </Text>
              </View>
            </View>

            <View style={tw`flex-row items-center`}>
              <TouchableOpacity 
                style={tw`mr-6`}
                onPress={toggleLike}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Heart 
                  size={24} 
                  color={isLiked ? '#1DB954' : 'white'} 
                  fill={isLiked ? '#1DB954' : 'transparent'}
                />
              </TouchableOpacity>
              <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Plus size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={tw`mb-6 w-full`}>
            <Slider
              style={tw`w-full mb-2`}
              minimumValue={0}
              maximumValue={duration}
              value={currentTime}
              minimumTrackTintColor="#ffffff"
              maximumTrackTintColor="#4b5563"
              thumbTintColor="#ffffff"
              onSlidingComplete={async (value) => {
                if (sound) {
                  try {
                    await sound.setPositionAsync(value);
                    setCurrentTime(value);
                  } catch (error) {
                    console.error('Error seeking:', error);
                  }
                }
              }}
            />
            <View style={tw`flex-row justify-between`}>
              <Text style={tw`text-gray-400 text-sm`}>
                {formatTime(currentTime)}
              </Text>
              <Text style={tw`text-gray-400 text-sm`}>
                {formatTime(duration)}
              </Text>
            </View>
          </View>

          <View style={tw`flex-row items-center justify-between mb-8`}>
            <TouchableOpacity 
              onPress={() => setIsShuffled(!isShuffled)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Shuffle size={20} color={isShuffled ? '#1DB954' : '#9CA3AF'} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={skipToPrevious} 
              disabled={isLoading || tracks.length <= 1}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <SkipBack 
                size={32} 
                color={isLoading || tracks.length <= 1 ? '#4B5563' : 'white'} 
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`bg-white rounded-full p-4 items-center justify-center`}
              onPress={togglePlayPause}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size={32} color="#22c55e" />
              ) : isPlaying ? (
                <Pause size={32} color="black" />
              ) : (
                <Play size={32} color="black" style={tw`ml-1`} />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={skipToNext} 
              disabled={isLoading || tracks.length <= 1}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <SkipForward 
                size={32} 
                color={isLoading || tracks.length <= 1 ? '#4B5563' : 'white'} 
              />
            </TouchableOpacity>

            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Clock size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-row items-center`}>
              <View style={tw`w-6 h-6 bg-green-500 rounded-full mr-2 items-center justify-center`}>
                <Text style={tw`text-black text-xs font-bold`}>🎧</Text>
              </View>
              <Text style={tw`text-green-500 text-sm font-medium`}>
                Airdopes Alpha
              </Text>
            </View>

            <View style={tw`flex-row items-center`}>
              <TouchableOpacity 
                style={tw`mr-6`}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Share size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Menu size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}
