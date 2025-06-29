import { Image, Text, View } from 'react-native'
import React from 'react'
import { Artist } from '@/src/constants/services/Models'
import tailwind from 'twrnc'

type Props = {
  item: Artist
}

const ArtistCard = ({ item }: Props) => {
  return (
    <View style={tailwind`ml-2 mt-2 items-center w-[130px]`}>
      <Image
        source={{ uri: item.image }}
        style={tailwind`w-[100px] h-[100px] rounded-full`}
      />
      <Text
        style={tailwind`text-white text-sm font-semibold mt-2 text-center`}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.name.length > 18 ? item.name.slice(0, 18) + '...' : item.name}
      </Text>
    </View>
  )
}

export default ArtistCard
