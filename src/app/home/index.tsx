import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import tailwind from "twrnc";
import AntDesign from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";
import {
  fetchTopTracks,
  fetchPopSongs,
  fetchRockSongs,
  fetchRomanticSongs,
  fetchCuteSongs,
  fetchHorrorSongs,
  fetchCountrySongs,
  fetchReggaeSongs,
  fetchBluesSongs,
  fetchFolkSongs,
} from "@/src/constants/services/API";
import { Song } from "@/src/constants/services/Models";
import SongCard from "@/src/components/SongCard";
import { useRouter } from "expo-router";

const Index = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [popSongs, setPopSongs] = useState<Song[]>([]);
  const [rockSongs, setRockSongs] = useState<Song[]>([]);
  const [romanticSongs, setRomanticSongs] = useState<Song[]>([]);
  const [cuteSongs, setCuteSongs] = useState<Song[]>([]);
  const [horrorSongs, setHorrorSongs] = useState<Song[]>([]);
  const [countrySongs, setCountrySongs] = useState<Song[]>([]);
  const [reggaeSongs, setReggaeSongs] = useState<Song[]>([]);
  const [bluesSongs, setBluesSongs] = useState<Song[]>([]);
  const [folkSongs, setFolkSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handlePress = (song: Song) => {
    const songArray = [song]; // wrap single song into an array
    const encodedSongs = encodeURIComponent(JSON.stringify(songArray));
    router.push(`/musicplayer?songs=${encodedSongs}`);
  };

  useEffect(() => {
    const loadSongs = async () => {
      try {
        // Fetch all song categories
        const [
          fetchedTopTracks,
          fetchedPopSongs,
          fetchedRockSongs,
          fetchedRomanticSongs,
          fetchedCuteSongs,
          fetchedHorrorSongs,
          fetchedCountrySongs,
          fetchedReggaeSongs,
          fetchedBluesSongs,
          fetchedFolkSongs,
        ] = await Promise.all([
          fetchTopTracks(),
          fetchPopSongs(),
          fetchRockSongs(),
          fetchRomanticSongs(),
          fetchCuteSongs(),
          fetchHorrorSongs(),
          fetchCountrySongs(),
          fetchReggaeSongs(),
          fetchBluesSongs(),
          fetchFolkSongs(),
        ]);

        // Set all state variables
        setSongs(fetchedTopTracks);
        setPopSongs(fetchedPopSongs);
        setRockSongs(fetchedRockSongs);
        setRomanticSongs(fetchedRomanticSongs);
        setCuteSongs(fetchedCuteSongs);
        setHorrorSongs(fetchedHorrorSongs);
        setCountrySongs(fetchedCountrySongs);
        setReggaeSongs(fetchedReggaeSongs);
        setBluesSongs(fetchedBluesSongs);
        setFolkSongs(fetchedFolkSongs);

        setLoading(false);
      } catch (error) {
        console.error("Error loading songs:", error);
        setLoading(false);
      }
    };

    loadSongs();
  }, []);

  const greetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 16) return "Good Afternoon";
    return "Good Evening";
  };

  const greeting = greetingMessage();

  const renderItem = ({ item }: { item: Song }) => {
    return (
      <Pressable
        style={tailwind`flex-row items-center gap-[10px] flex-1 my-[10px] mx-[4px] bg-[#202020] rounded-[4px] z-3`}
      >
        <Image style={{ height: 55, width: 55 }} source={{ uri: item.image }} />
        <View style={tailwind`flex-1 justify-center`}>
          <Text style={tailwind`text-white text-[13px] font-bold ml-2`}>
            {item.title.length > 10
              ? `${item.title.slice(0, 10)}...`
              : item.title}
          </Text>
        </View>
      </Pressable>
    );
  };

  // Loader view
  if (loading) {
    return (
      <View style={tailwind`flex-1 justify-center items-center bg-[#101010]`}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={tailwind`pt-4 px-2 bg-[#101010] pb-28`}>
      {/* Header */}
      <View style={tailwind`p-[6px] flex-row items-center justify-between`}>
        <View style={tailwind`flex-row items-center`}>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/women/75.jpg" }}
            style={tailwind`w-[40px] h-[40px] rounded-full object-cover`}
            resizeMode="cover"
          />
          <Text style={tailwind`ml-[13px] text-[20px] font-bold text-white`}>
            {greeting}
          </Text>
        </View>
        <AntDesign name="user" size={24} color="white" />
      </View>

      {/* Category Buttons */}
      <View style={tailwind`mt-4 flex-row items-center`}>
        <Pressable style={tailwind`bg-[#282828] p-[12px] rounded-full mb-4`}>
          <Text style={tailwind`text-white text-[15px]`}>Music</Text>
        </Pressable>
        <Pressable
          style={tailwind`bg-[#282828] ml-[15px] p-[12px] rounded-full mb-4`}
        >
          <Text style={tailwind`text-white text-[15px]`}>
            Podcast & Shows
          </Text>
        </Pressable>
      </View>

      {/* Liked Songs and Popular */}
      <View style={tailwind`flex-row items-center justify-between`}>
        <Pressable 
          onPress={() => router.push("/(tabs)/Liked")}
          style={tailwind`flex-row items-center gap-[10px] flex-1 my-[10px] mx-[4px] bg-[#202020] rounded-[4px] z-3`}
        >
          <LinearGradient
            colors={["#33006f", "#FFFFFF"]}
            style={tailwind`w-[55px] h-[55px] items-center justify-center rounded-[4px]`}
          >
            <AntDesign name="heart" size={24} color="white" />
          </LinearGradient>
          <Text style={tailwind`text-white text-[13px] font-bold ml-2`}>
            Liked Songs
          </Text>
        </Pressable>

        <View
          style={tailwind`flex-row items-center gap-[10px] flex-1 my-[10px] mx-[4px] bg-[#202020] rounded-[4px] z-3`}
        >
          <Image
            style={tailwind`w-[55px] h-[55px]`}
            source={{ uri: "https://randomuser.me/api/portraits/women/75.jpg" }}
          />
          <View>
            <Text style={tailwind`text-white text-[13px] font-bold ml-2`}>
              Popular Mix
            </Text>
          </View>
        </View>
      </View>

      {/* First 4 Songs Grid */}
      <View style={tailwind`flex-row flex-wrap justify-between`}>
        {songs.slice(0, 4).map((item, index) => (
          <Pressable onPress={() => handlePress(item)} key={index} style={tailwind`w-[48%]`}>
            {renderItem({ item })}
          </Pressable>
        ))}
      </View>

      {/* Your Top Songs */}
      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Your Top Songs
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={tailwind`mt-2`}
      >
        {songs.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <SongCard item={item} />
          </View>
        ))}
      </ScrollView>

      {/* Pop Songs */}
      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Pop these songs
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={tailwind`mt-2`}
      >
        {popSongs.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <SongCard item={item} />
          </View>
        ))}
      </ScrollView>

      {/* Rock Songs */}
      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Rock Vibes
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tailwind`mt-2`}>
        {rockSongs.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <SongCard item={item} />
          </View>
        ))}
      </ScrollView>

      {/* Romantic Songs */}
      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Celebrate song with the one
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={tailwind`mt-2`}
      >
        {romanticSongs.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <SongCard item={item} />
          </View>
        ))}
      </ScrollView>

      {/* Cute Songs */}
      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Cute & Chill
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={tailwind`mt-2`}
      >
        {cuteSongs.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <SongCard item={item} />
          </View>
        ))}
      </ScrollView>

      {/* Horror Songs */}
      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Dark & Mysterious
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tailwind`mt-2`}>
        {horrorSongs.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <SongCard item={item} />
          </View>
        ))}
      </ScrollView>

      {/* Country Songs */}
      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Country Roads
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tailwind`mt-2`}>
        {countrySongs.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <SongCard item={item} />
          </View>
        ))}
      </ScrollView>

      {/* Reggae Songs */}
      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Reggae Rhythms
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tailwind`mt-2`}>
        {reggaeSongs.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <SongCard item={item} />
          </View>
        ))}
      </ScrollView>

      {/* Blues Songs */}
      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Blues Collection
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tailwind`mt-2`}>
        {bluesSongs.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <SongCard item={item} />
          </View>
        ))}
      </ScrollView>

      {/* Folk Songs */}
      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Folk Essentials
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tailwind`mt-2`}>
        {folkSongs.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <SongCard item={item} />
          </View>
        ))}
      </ScrollView>
    </ScrollView>
  );
};

export default Index;
