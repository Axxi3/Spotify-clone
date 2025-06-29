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
  fetchTopAlbums,
  fetchTopTracks,
  fetchTopArtists,
  fetchTracksByGenre,
} from "@/src/constants/services/API";
import { Album, Artist, Song } from "@/src/constants/services/Models";
import SongCard from "@/src/components/SongCard";
import AlbumCard from "@/src/components/AlbumCard";
import ArtistCard from "@/src/components/ArtistCard";
import { useRouter } from "expo-router";

const Index = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [lofi, setlofiSongs] = useState<Song[]>([]);
  const [romantic, setromantic] = useState<Song[]>([]);
  const [pop, setpop] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [topartist, setTopArtist] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [rock, setRock] = useState<Song[]>([]);
  const [electronic, setElectronic] = useState<Song[]>([]);
  const [jazz, setJazz] = useState<Song[]>([]);
  const [hiphop, setHipHop] = useState<Song[]>([]);
  const [chillout, setChillout] = useState<Song[]>([]);
  const [classical, setClassical] = useState<Song[]>([]);
  const [indie, setIndie] = useState<Song[]>([]);
  const [instrumental, setInstrumental] = useState<Song[]>([]);
  const router = useRouter();


  const handlePress = (song: Song) => {
    const songArray = [song]; // wrap single song into an array
    const encodedSongs = encodeURIComponent(JSON.stringify(songArray));
    router.push(`/musicplayer?songs=${encodedSongs}`);
  };


  useEffect(() => {
    const loadSongs = async () => {
      const fetchedSongs = await fetchTopTracks();
      const fetchedAlbums = await fetchTopAlbums();
      const fetchedArtists = await fetchTopArtists();

      const lofiTracks = await fetchTracksByGenre("lofi");
      const romanticTracks = await fetchTracksByGenre("romantic");
      const popTracks = await fetchTracksByGenre("pop");

      const rockTracks = await fetchTracksByGenre("rock");
      const electronicTracks = await fetchTracksByGenre("electronic");
      const jazzTracks = await fetchTracksByGenre("jazz");
      const hiphopTracks = await fetchTracksByGenre("hiphop");
      const chilloutTracks = await fetchTracksByGenre("chillout");
      const classicalTracks = await fetchTracksByGenre("classical");
      const indieTracks = await fetchTracksByGenre("indie");
      const instrumentalTracks = await fetchTracksByGenre("instrumental");

      setSongs(fetchedSongs);
      setAlbums(fetchedAlbums);
      setTopArtist(fetchedArtists);
      setlofiSongs(lofiTracks);
      setromantic(romanticTracks);
      setpop(popTracks);

      setRock(rockTracks);
      setElectronic(electronicTracks);
      setJazz(jazzTracks);
      setHipHop(hiphopTracks);
      setChillout(chilloutTracks);
      setClassical(classicalTracks);
      setIndie(indieTracks);
      setInstrumental(instrumentalTracks);

      setLoading(false);
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

      {/* Liked Songs and Hiphops */}
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
              Hiphops
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

      {/* Top Songs */}
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

      {/* Top Albums */}
      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Your Top Albums
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={tailwind`mt-[10px]`}
      >
        {albums.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <AlbumCard item={item} />
          </View>
        ))}
      </ScrollView>


      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Your charts for Lofi
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={tailwind`mt-2`}
      >
        {lofi.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <SongCard item={item} />
          </View>
        ))}
      </ScrollView>

      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Celebrate song with the one
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={tailwind`mt-2`}
      >
        {romantic.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <SongCard item={item} />
          </View>
        ))}
      </ScrollView>


      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Pop these songs
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={tailwind`mt-2`}
      >
        {pop.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <SongCard item={item} />
          </View>
        ))}
      </ScrollView>

      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Rock Vibes
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tailwind`mt-2`}>
        {rock.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <SongCard item={item} />
          </View>
        ))}
      </ScrollView>

      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Electronic Beats
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tailwind`mt-2`}>
        {electronic.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <SongCard item={item} />
          </View>
        ))}
      </ScrollView>

      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Smooth Jazz
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tailwind`mt-2`}>
        {jazz.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <SongCard item={item} />
          </View>
        ))}
      </ScrollView>

      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Hip-Hop Hits
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tailwind`mt-2`}>
        {hiphop.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <SongCard item={item} />
          </View>
        ))}
      </ScrollView>

      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Chillout Essentials
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tailwind`mt-2`}>
        {chillout.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <SongCard item={item} />
          </View>
        ))}
      </ScrollView>

      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Classical Collection
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tailwind`mt-2`}>
        {classical.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <SongCard item={item} />
          </View>
        ))}
      </ScrollView>

      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Indie Spotlight
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tailwind`mt-2`}>
        {indie.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <SongCard item={item} />
          </View>
        ))}
      </ScrollView>

      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Instrumental Moods
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tailwind`mt-2`}>
        {instrumental.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <SongCard item={item} />
          </View>
        ))}
      </ScrollView>


      {/* Top Artists
      <Text style={tailwind`text-white font-bold text-[19px] mt-6`}>
        Your Top Artist
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={tailwind`mt-[10px]`}
      >
        {topartist.map((item, index) => (
          <View key={index} style={tailwind`mr-4`}>
            <ArtistCard item={item} />
          </View>
        ))}
      </ScrollView> */}
    </ScrollView>
  );
};

export default Index;
