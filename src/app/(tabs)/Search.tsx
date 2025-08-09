import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Camera } from 'lucide-react-native';
import tw from 'twrnc';
import { Song } from '@/src/constants/services/Models';
import { searchSongs } from '@/src/constants/services/API';

const { width } = Dimensions.get('window');

const SearchPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [searchHistory, setSearchHistory] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [error, setError] = useState(''); // Added error state

  // Load search history on component mount
  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('searchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const saveToSearchHistory = async (song: Song) => {
    try {
      // Remove if already exists to avoid duplicates
      const filteredHistory = searchHistory.filter(item => item.id !== song.id);
      
      // Add to beginning and keep only 10 items
      const newHistory = [song, ...filteredHistory].slice(0, 10);
      
      setSearchHistory(newHistory);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving to search history:', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowHistory(true);
      setError('');
      return;
    }

    setIsLoading(true);
    setShowHistory(false);
    setError('');

    try {
      const results = await searchSongs(query);
      setSearchResults(results);
      
      // Show message if no results found
      if (results.length === 0) {
        setError('No songs found matching your search');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSongPress = (song: Song) => {
    // Save to search history
    saveToSearchHistory(song);
    
    // Navigate to music player with the selected song
    const songArray = [song]; // wrap single song into an array
    const encodedSongs = encodeURIComponent(JSON.stringify(songArray));
    router.push(`/musicplayer?songs=${encodedSongs}`);
  };

  const clearSearchHistory = async () => {
    try {
      await AsyncStorage.removeItem('searchHistory');
      setSearchHistory([]);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  const renderSongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity 
      style={tw`flex-row items-center py-3 border-b border-gray-800`} 
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
        <Text 
          style={tw`text-gray-400 text-sm mt-1`} 
          numberOfLines={1}
        >
          {item.artist}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={tw`flex-1 justify-center items-center py-15`}>
      <Text style={tw`text-white text-lg font-medium mb-2`}>
        {showHistory ? 'No search history yet' : error || 'No results found'}
      </Text>
      <Text style={tw`text-gray-400 text-sm text-center`}>
        {showHistory ? 'Start searching for songs!' : 'Try a different search term'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-[#202020] pt-[15px]`}>
      <View style={tw`flex-row items-center justify-between px-5 py-4 border-b border-gray-800`}>
        <Text style={tw`text-white text-[19px] font-bold flex-1 text-center mx-5`}>
          Search
        </Text>
        <TouchableOpacity style={tw`w-10 h-10 justify-center items-center`}>
          <Camera color="#ffffff" size={24} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={tw`px-5 py-4`}>
        <View style={tw`flex-row items-center bg-gray-800 rounded-lg px-4 h-12`}>
          <Text style={tw`text-gray-400 text-base mr-3`}>🔍</Text>
          <TextInput
            style={tw`flex-1 text-white text-base`}
            placeholder="What do you want to listen to?"
            placeholderTextColor="#b3b3b3"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              // Debounce search for better performance
              if (text.trim()) {
                handleSearch(text);
              } else {
                setSearchResults([]);
                setShowHistory(true);
                setError('');
              }
            }}
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(searchQuery)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
                setShowHistory(true);
                setError('');
              }}
            >
              <Text style={tw`text-gray-400 text-base ml-3`}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={tw`flex-1 px-5`}>
        {showHistory && searchHistory.length > 0 && (
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <Text style={tw`text-white text-lg font-bold`}>Recent searches</Text>
            <TouchableOpacity onPress={clearSearchHistory}>
              <Text style={tw`text-gray-400 text-sm`}>Clear all</Text>
            </TouchableOpacity>
          </View>
        )}

        {isLoading ? (
          <View style={tw`flex-1 justify-center items-center`}>
            <ActivityIndicator size="large" color="#1db954" />
            <Text style={tw`text-gray-400 mt-4 text-base`}>Searching...</Text>
          </View>
        ) : (
          <FlatList
            data={showHistory ? searchHistory : searchResults}
            renderItem={renderSongItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={tw`flex-grow`}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchPage;
