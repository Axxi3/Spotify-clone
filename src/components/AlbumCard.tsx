import { Image, Text, View, Pressable } from 'react-native';
import React from 'react';
import { Album } from '@/src/constants/services/Models';
import tailwind from 'twrnc';
import { useRouter } from 'expo-router'; // ✅ correct hook for Expo Router

type Props = {
  item: Album;
};

const AlbumCard = ({ item }: Props) => {
  const router = useRouter();

  const handlePress = () => {
   router.push(`/albumdetails?id=${item.id}&title=${encodeURIComponent(item.title)}&image=${encodeURIComponent(item.image)}`);
  };

  return (
    <Pressable onPress={handlePress} style={tailwind`ml-[7px] mt-[3px]`}>
      <Image source={{ uri: item.image }} style={tailwind`w-[130px] h-[130px] rounded`} />
      <Text
        style={tailwind`text-white text-[13px] font-bold mt-2`}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.title.length > 18 ? item.title.slice(0, 18) + '...' : item.title}
      </Text>
    </Pressable>
  );
};

export default AlbumCard;
