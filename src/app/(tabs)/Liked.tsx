import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { 
  ArrowLeft, 
  Search, 
  Download, 
  Shuffle, 
  Play, 
  Plus,
  MoreVertical 
} from 'lucide-react-native';
import tw from 'twrnc';
import { Song } from '@/src/constants/services/Models';

const LIKED_SONGS_KEY = 'liked_songs';

const LikedSongsScreen = () => {
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Make loadLikedSongs a useCallback to prevent recreation on every render
  const loadLikedSongs = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(LIKED_SONGS_KEY);
      if (stored) {
        const songs = JSON.parse(stored);
        setLikedSongs(songs);
      } else {
        // Handle case when no songs are stored
        setLikedSongs([]);
      }
    } catch (error) {
      console.error('Error loading liked songs:', error);
      Alert.alert('Error', 'Failed to load liked songs');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load liked songs when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadLikedSongs();
    }, [loadLikedSongs])
  );

  // Add refresh handler with proper dependency
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLikedSongs();
    setRefreshing(false);
  }, [loadLikedSongs]);

  // Filter songs based on search query
  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return likedSongs;
    
    return likedSongs.filter(song =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [likedSongs, searchQuery]);

  const handleSongPress = (song: Song) => {
    console.log('Playing song:', song.title);
  };

  const handleRemoveFromLiked = async (songId: string) => {
    try {
      const updatedSongs = likedSongs.filter(song => song.id !== songId);
      setLikedSongs(updatedSongs);
      await AsyncStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(updatedSongs));
    } catch (error) {
      console.error('Error removing song:', error);
      Alert.alert('Error', 'Failed to remove song');
    }
  };

  const renderSongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity 
      style={tw`flex-row items-center py-3 px-4`} 
      onPress={() => handleSongPress(item)}
    >
      <Image 
        source={{ uri: item.image }} 
        style={tw`w-14 h-14 rounded bg-gray-800`} 
      />
      <View style={tw`flex-1 ml-4`}>
        <Text 
          style={tw`text-white text-base font-medium`} 
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <View style={tw`flex-row items-center mt-1`}>
          <View style={tw`bg-gray-600 px-1 py-0.5 rounded-sm mr-2`}>
            <Text style={tw`text-white text-xs font-bold`}>E</Text>
          </View>
          <Text 
            style={tw`text-gray-400 text-sm`} 
            numberOfLines={1}
          >
            {item.artist}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={tw`p-2`}>
        <MoreVertical size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAddToPlaylistItem = () => (
    <TouchableOpacity 
      style={tw`flex-row items-center py-4 px-4`}
    >
      <View style={tw`w-14 h-14 bg-gray-700 rounded items-center justify-center`}>
        <Plus size={24} color="white" />
      </View>
      <View style={tw`flex-1 ml-4`}>
        <Text style={tw`text-white text-base font-medium`}>
          Add to this playlist
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      {/* Top Navigation */}
      <View style={tw`flex-row items-center justify-between px-4 pt-4 pb-6`}>
        <TouchableOpacity>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search and Sort */}
      <View style={tw`flex-row items-center px-4 mb-8`}>
        <View style={tw`flex-1 flex-row h-[50px] items-center bg-gray-800 bg-opacity-50 rounded-lg px-4  mr-3`}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={tw`flex-1 ml-3 text-white text-base`}
            placeholder="Find in Liked Songs"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Title and Song Count */}
      <View style={tw`px-4 mb-6`}>
        <Text style={tw`text-white text-3xl font-bold mb-2`}>Liked Songs</Text>
        <Text style={tw`text-gray-400 text-base`}>
          {likedSongs.length} songs
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={tw`flex-row items-center justify-between px-4 mb-6`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity style={tw`mr-8`}>
            <Download size={28} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Shuffle size={28} color="#1DB954" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={tw`w-14 h-14 bg-green-500 rounded-full items-center justify-center`}
        >
          <Play size={20} color="black" fill="black" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={tw`flex-1 items-center justify-center px-8 mt-20`}>
      <Text style={tw`text-white text-xl font-semibold text-center`}>
        {searchQuery ? 'No songs found' : 'No liked songs yet'}
      </Text>
      <Text style={tw`text-gray-400 text-center mt-2`}>
        {searchQuery 
          ? 'Try searching with different keywords'
          : 'Songs you like will appear here'
        }
      </Text>
    </View>
  );

  const allData = useMemo(() => {
    const data = [];
    if (filteredSongs.length > 0) {
      data.push({ type: 'add_to_playlist', id: 'add_to_playlist' });
      data.push(...filteredSongs.map(song => ({ type: 'song', ...song })));
    }
    return data;
  }, [filteredSongs]);

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'add_to_playlist') {
      return renderAddToPlaylistItem();
    }
    return renderSongItem({ item });
  };

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-[#151515]`}>
        <StatusBar barStyle="light-content" backgroundColor="black" />
        <View style={tw`flex-1 items-center justify-center`}>
          <Text style={tw`text-white text-lg`}>Loading liked songs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-[#202020]`}>
      <StatusBar barStyle="light-content" backgroundColor="#202020" />
      
      {/* Gradient Background */}
      <View style={tw`flex-1 bg-gradient-to-b from-blue-600 to-black`}>
        {allData.length === 0 ? (
          <View style={tw`flex-1`}>
            {renderHeader()}
            {renderEmptyState()}
          </View>
        ) : (
          <FlatList
            data={allData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={tw`flex-1 mb-[50px]`}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-6`}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                tintColor="#1DB954" // Green color for the refresh indicator
                colors={["#1DB954"]} // Android
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default LikedSongsScreen;