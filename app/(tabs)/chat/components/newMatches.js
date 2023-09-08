import { globalStyles } from '../../../../globalDesign';
import { ScrollView, View, Pressable, Image, StyleSheet } from 'react-native';
import { getAgeFromBirthday, errorToast } from '../../../../utilities';
import { useState, useEffect } from 'react';
import { supabase } from '../../../../supabaseConnect';
import { useRouter } from 'expo-router';

// displays new matches
const NewMatches = ({ userID, matches }) => {
    const router = useRouter();

    // other states
    const [userMatches, setUserMatches] = useState(null);
    const [otherImages, setOtherImages] = useState(null);

    // grabs others profiles from db along with their first image and sets others states
    useEffect(() => {
        // grabs others profiles from db
        if (!userMatches) {
            (async () => {
                const otherIDs = matches?.map(match => (match[0]));
                const { data, error } = await supabase.from('profiles').select().in('id', otherIDs);
                if (data[0]) {
                    setUserMatches(data);
                } else if (error) {
                    errorToast(error.message);
                }
            })()
        }

        // grabs others first images
        if (userMatches?.length > 0) {
            if (!otherImages) {
                (async () => {
                    const imageIDs = userMatches?.map(item => (item.imageOne));
                    const expirationSeconds = 60;
                    const { data, error } = await supabase.storage.from('avatars').createSignedUrls(imageIDs, expirationSeconds);
                    if (data[0]) {
                        const urls = data.map(item => (item.signedUrl));
                        setOtherImages(urls);
                    } else if (error) {
                        errorToast(error.message);
                    }
                })()
            }
        }
    },[userMatches])

    return (
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{paddingBottom: 6, marginRight: 3}} contentContainerStyle={{columnGap: 10}}>
            {/* checks if all others states have been set */}
            {(userMatches?.length > 0 && otherImages) &&
            userMatches?.map((item, index) => (
                // pressing routes the user to the match page
                <Pressable 
                    key={item.id}
                    onPress={()=>{router.push({pathname:'/chat/match', params: {
                        userID: userID,
                        otherID: item.id,
                        full_name: item.full_name,
                        age: getAgeFromBirthday(item.birthday),
                        emoji: item.emoji,
                        bio: item.bio,
                        occupation: item.occupation,
                        images: [item.imageOne, item.imageTwo, item.imageThree, item.imageFour],
                        imageOne: item.imageOne,
                        activated: false,
                        matchID: matches[index][1],
                        location: matches[index][2],
                        time: matches[index][3],
                    }
                    })}}
                    style={styles.circleImageBorder}
                >
                    {/* displays match image */}
                    <View style={styles.circleImage}>
                        <Image style={styles.circleImage} source={{uri: otherImages[index]}}/>
                    </View>
                </Pressable>
            ))
            }
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    circleImage: {
        backgroundColor:'grey',
        height: 80,
        width: 80,
        borderRadius: 40,
        overflow: 'hidden',
    },
    circleImageBorder: {
        ...globalStyles.boxShadows,
        height: 90,
        width: 90,
        borderRadius: 45,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        // overflow: 'hidden'
    }
})

export default NewMatches;