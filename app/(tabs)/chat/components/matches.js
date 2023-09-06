import { globalStyles, globalColors, globalSizes } from '../../../../globalDesign';
import { ScrollView, View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { getAgeFromBirthday, errorToast } from '../../../../utilities';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { supabase } from '../../../../supabaseConnect';
import { useRouter } from 'expo-router';

// displays active matches
const Matches = ({ userID, matches }) => {
    const router = useRouter();

    // states
    const [userMatches, setUserMatches] = useState(null);
    const [otherImages, setOtherImages] = useState(null);
    const [matchMessages, setMatchMessages] = useState(null);

    // grabs others profiles from db along with their first image and last message from match and sets others states
    useEffect(() => {
        // grabs others profiles from db
        if (!userMatches) {
            (async () => {
                const otherIDs = matches?.map(match => (match[0]));
                const { data, error } = await supabase.from('profiles').select().in('id', otherIDs);
                if (data) {
                    setUserMatches(data);
                } else if (error) {
                    errorToast(error.message);
                }
            })()
        }

        // grabs others first images and last messages from match
        if (userMatches?.length > 0) {
            // grabs others first images
            if (!otherImages) {
                (async () => {
                    const imageIDs = userMatches?.map(item => (item.imageOne));

                    const expirationSeconds = 10;
                    const { data, error } = await supabase.storage.from('avatars').createSignedUrls(imageIDs, expirationSeconds);
                    if (data) {
                        const urls = data.map(item => (item.signedUrl));
                        setOtherImages(urls);
                    } else if (error) {
                        errorToast(error.message);
                    }
                })()
            }

            // grabs others last messages from match
            if (!matchMessages) {    
                const messages = [];
                matches?.map(async (item, index) => {
                    // grab a message from db and marks whether it was sent or recieved
                    const { data, error } = await supabase.from('messages').select().eq('match_id', item[1]).order('created_at',{ascending: false}).limit(1);
                    if (data) {
                        const recieved = (userID === data[0].user) ? true : false;
                        messages.push([data[0].message, recieved]);
                    } else if (error) {
                        errorToast(error.message);
                    }

                    // listens to db for new messages in chat and then updates message state
                    supabase
                    .channel('chat_changes')
                    .on(
                      'postgres_changes',
                      {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'messages',
                        filter: `match_id=eq.${item[1]}`
                      },
                      (payload) => {
                        let msgs = [...messages];
                        const recieved = (userID === payload.new.user) ? true : false;
                        msgs[index] = [payload.new.message, recieved];
                        setMatchMessages(msgs);
                      }
                    )
                    .subscribe()
                })
                setMatchMessages(messages);
            }
        }
    },[userMatches])

    // shortens a message to 25 chars for previewing in match card
    const validateMessage = (message) => {
        if (message.length > 25) {
            return message.slice(0, 25) + '...';
        } else {
            return message;
        }
    }

    return (
        <ScrollView showsVerticalScrollIndicator={false} style={{paddingRight: 4}} contentContainerStyle={{rowGap: 14, flex: 1}}>
            {/* checks if all others states have been set */}
            {(userMatches?.length > 0 && otherImages && matchMessages) &&
            userMatches?.map((item, index)=>(
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
                        activated: true,
                        matchID: matches[index][1],
                        location: matches[index][2],
                        time: matches[index][3],
                    }})}}
                    style={styles.matchCard}
                >
                    {/* displays match image */}
                    <View style={styles.matchCardImage}>
                        <Image source={{uri: otherImages[index]}} style={styles.matchCardImage}/>
                    </View>
                    {/* displays match name and most recent message */}
                    <View style={{rowGap: 1}}>
                        <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{...globalStyles.fontSmallBold, color: globalColors.darkNeutral}}>{item.full_name} {item.emoji}</Text>
                        <View style={{flexDirection: 'row', alignItems: 'center', columnGap: 4}}>
                            {matchMessages[index][1] && <Ionicons name="arrow-undo" size={globalSizes.mini} color={globalColors.neutral} />}
                            <Text style={{...globalStyles.fontSmall, color: globalColors.neutral}}>{validateMessage(matchMessages[index][0])}</Text>
                        </View>
                    </View>
                </Pressable>
            ))
            }
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    matchCardImage: {
        backgroundColor:'grey',
        height: 60,
        width: 60,
        borderRadius: 30,
        overflow: 'hidden'
    },
    matchCard: {
        ...globalStyles.boxShadows,
        flexDirection: 'row',
        backgroundColor: 'white',
        width: '100%',
        padding: 10,
        borderRadius: 14,
        alignItems: 'center',
        columnGap: 18,
    }
})

export default Matches;