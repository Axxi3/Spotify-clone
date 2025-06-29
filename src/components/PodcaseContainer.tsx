import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, Dimensions } from 'react-native';
import { fetchRadios } from '@/src/constants/services/API'; // adjust path as needed
import { Radio } from '@/src/constants/services/Models';
import tailwind from 'twrnc';

const screenWidth = Dimensions.get('window').width;
const itemWidth = screenWidth / 3 - 18; // Adjust spacing between items

const PodcaseContainer = () => {
    const [radios, setRadios] = useState<Radio[]>([]);

    useEffect(() => {
        const loadRadios = async () => {
            const fetchedRadios = await fetchRadios();
            setRadios(fetchedRadios);
        };

        loadRadios();
    }, []);

    return (
        <ScrollView contentContainerStyle={tailwind`bg-[#101010] px-3 pt-4 pb-28`}>
            <Text style={tailwind`text-white font-bold text-[19px] mb-3`}>
                Your favourite Podcasts
            </Text>

            <View style={tailwind`flex-row flex-wrap gap-[10px] justify-between`}>
                {radios.map((radio, index) => (
                    <View
                        key={radio.id}
                        style={[
                            tailwind`mb-5`,
                            { width: itemWidth }
                        ]}
                    >
                        <View style={tailwind`ml-[7px] mt-[3px]`}>
                            <Image source={{ uri: radio.image }} style={tailwind`w-[130px] h-[130px]`} />
                            <Text style={tailwind`text-white text-[13px] font-bold mt-2`} numberOfLines={1} ellipsizeMode="tail">
                                {radio.dispname}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

export default PodcaseContainer;
