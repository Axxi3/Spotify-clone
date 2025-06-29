import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Song } from '@/src/constants/services/Models'
import tailwind from 'twrnc'
import { useRouter } from 'expo-router'

type Props = {
  item: Song
}

const SongCard = ({ item }: Props) => {
  const router = useRouter();
  
  
    const handlePress = () => {
  const songArray = [item]; // wrap single song into an array
  const encodedSongs = encodeURIComponent(JSON.stringify(songArray));
  router.push(`/musicplayer?songs=${encodedSongs}`);
};
  return (
    <Pressable onPress={handlePress} style={tailwind`ml-[7px] mt-[3px]`}>
      <Image source={{ uri: item.image }} style={tailwind`w-[130px] h-[130px]`} />
      <Text style={tailwind`text-white text-[13px] font-bold mt-2`} numberOfLines={1} ellipsizeMode="tail">
        {item.title.length > 18 ? item.title.slice(0, 18) + '...' : item.title}
      </Text>
    </Pressable>
  )
}

export default SongCard

