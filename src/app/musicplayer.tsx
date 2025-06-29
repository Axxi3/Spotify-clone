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
import { useLocalSearchParams } from 'expo-router';
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

const { width } = Dimensions.get('window');
const LIKED_SONGS_KEY = 'liked_songs';

export default function SpotifyMusicPlayer() {
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
      await loadAudio(track.audioUrl);
    };

    setup();
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  useEffect(() => {
    setTrack(track);
    checkIfSongIsLiked(track);
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
        // Remove from liked songs
        updatedLikedSongs = likedSongs.filter(song => song.id !== track.id);
        setIsLiked(false);
      } else {
        // Add to liked songs
        updatedLikedSongs = [...likedSongs, track];
        setIsLiked(true);
      }
      
      setLikedSongs(updatedLikedSongs);
      await AsyncStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(updatedLikedSongs));
      
      // Show feedback to user
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
      setIsInitialLoading(true);
      if (sound) await sound.unloadAsync();

      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setDuration(status.durationMillis || 0);
      setIsInitialLoading(false);
    } catch (error) {
      console.error('Audio load error', error);
      setIsInitialLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        handleTrackEnd();
      }
    }
  };

  const handleTrackEnd = () => {
    if (currentTrackIndex < tracks.length - 1) {
      skipToNext();
    } else {
      setIsPlaying(false);
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (status.isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const skipToNext = async () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIndex);
    await loadAudio(tracks[nextIndex].audioUrl);
  };

  const skipToPrevious = async () => {
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIndex);
    await loadAudio(tracks[prevIndex].audioUrl);
  };

  const formatTime = (millis: number) => {
    const totalSecs = Math.floor(millis / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isInitialLoading) {
    return (
      <View style={tw`flex-1 bg-black items-center justify-center`}>
        <ActivityIndicator size="large" color="white" />
        <Text style={tw`text-white mt-4`}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-black`}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={tw`flex-row items-center justify-between px-6 pt-3 pb-4`}>
        <TouchableOpacity>
          <ChevronDown size={28} color={tw.color('white')} />
        </TouchableOpacity>
        <View style={tw`items-center flex-1`}>
          <Text style={tw`text-gray-400 text-xs font-medium tracking-wide`}>
            BASED ON YOUR INTEREST IN
          </Text>
          <Text style={tw`text-white text-sm font-medium`}>
            {track.album || 'Unknown Album'}
          </Text>
        </View>
        <TouchableOpacity>
          <MoreHorizontal size={24} color={tw.color('white')} />
        </TouchableOpacity>
      </View>

      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
        <View style={tw`mx-6 mb-8`}>
          <View style={tw`bg-white rounded-lg p-6 shadow-lg`}>
            <View style={tw`items-center mb-4`}>
              <Text style={tw`text-black text-lg font-bold mb-1`}>
                {track.title.toUpperCase()}
              </Text>
              <Text style={tw`text-gray-600 text-sm font-medium tracking-wide`}>
                {track.album || 'Unknown Album'}
              </Text>
            </View>

            <Image
              source={{ uri: track.image }}
              style={tw`w-full h-64 rounded-lg mb-4`}
              resizeMode="cover"
            />

            <View style={tw`items-end`}>
              <Text style={tw`text-black text-sm font-medium`}>
                {track.artist.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={tw`px-6 mb-8`}>
          <View style={tw`flex-row items-center justify-between mb-4`}>
            <View style={tw`flex-1`}>
              <Text style={tw`text-white text-xl font-bold mb-1`}>
                {track.title}
              </Text>
              <View style={tw`flex-row items-center`}>
                <View style={tw`w-3 h-3 bg-green-500 rounded-full mr-2`} />
                <Text style={tw`text-gray-300 text-base`}>
                  {track.artist}
                </Text>
              </View>
            </View>

            <View style={tw`flex-row items-center`}>
              <TouchableOpacity 
                style={tw`mr-6`}
                onPress={toggleLike}
              >
                <Heart 
                  size={24} 
                  color={isLiked ? '#1DB954' : 'white'} 
                  fill={isLiked ? '#1DB954' : 'transparent'}
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <Plus size={24} color={tw.color('white')} />
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
  maximumTrackTintColor="#4b5563" // tailwind's gray-700
  thumbTintColor="#ffffff"
  onSlidingComplete={async (value) => {
    if (sound) {
      await sound.setPositionAsync(value);
      setCurrentTime(value);
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
            <TouchableOpacity onPress={() => setIsShuffled(!isShuffled)}>
              <Shuffle size={20} color={isShuffled ? tw.color('green-500') : tw.color('gray-400')} />
            </TouchableOpacity>

            <TouchableOpacity onPress={skipToPrevious} disabled={isLoading}>
              <SkipBack size={32} color={isLoading ? tw.color('gray-600') : tw.color('white')} />
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`bg-white rounded-full p-4 items-center justify-center`}
              onPress={togglePlayPause}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size={32} color="#22c55e" />
              ) : isPlaying ? (
                <Pause size={32} color={tw.color('black')} />
              ) : (
                <Play size={32} color={tw.color('black')} style={tw`ml-1`} />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={skipToNext} disabled={isLoading}>
              <SkipForward size={32} color={isLoading ? tw.color('gray-600') : tw.color('white')} />
            </TouchableOpacity>

            <TouchableOpacity>
              <Clock size={20} color={tw.color('gray-400')} />
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
              <TouchableOpacity style={tw`mr-6`}>
                <Share size={20} color={tw.color('white')} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Menu size={20} color={tw.color('white')} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}