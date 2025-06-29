import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import tw from 'twrnc';
import { usePlayerStore } from '@/src/constants/services/playerStore';
import { Pause, Play } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const MiniPlayer = () => {
  const { currentTrack, isPlaying, setIsPlaying, sound } = usePlayerStore();
  const router = useRouter();

  if (!currentTrack) return null;

  const handleToggle = async (e: any) => {
    e.stopPropagation(); // prevent parent Touchable from triggering
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

  const handleOpenPlayer = () => {
    router.push({
      pathname: '/musicplayer',
      params: { songs: encodeURIComponent(JSON.stringify([currentTrack])) }, // or full playlist if needed
    });
  };

  return (
    <TouchableOpacity
      onPress={handleOpenPlayer}
      style={[tw`bg-[#1a1a1a] px-4 py-2 flex-row items-center border-t border-gray-800`, styles.container]}
      activeOpacity={0.9}
    >
      <Image source={{ uri: currentTrack.image }} style={tw`w-12 h-12 rounded mr-3`} />
      <View style={tw`flex-1`}>
        <Text style={tw`text-white font-semibold`} numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text style={tw`text-gray-400 text-sm`} numberOfLines={1}>
          {currentTrack.artist}
        </Text>
      </View>

      <TouchableOpacity onPress={handleToggle} style={tw`ml-4`} hitSlop={10}>
        {isPlaying ? (
          <Pause color="white" size={24} />
        ) : (
          <Play color="white" size={24} style={tw`ml-1`} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 70, // same as tab bar height
    left: 0,
    right: 0,
    zIndex: 999,
  },
});

export default MiniPlayer;
