import { globalStyles, globalDimensions, globalSizes, globalColors} from '../../../globalDesign';
import { SafeAreaView, Text, StyleSheet, ImageBackground, View, Pressable, Image, Keyboard } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons'; 
import { RootSiblingParent } from 'react-native-root-siblings';
import { errorToast } from '../../../utilities'
import Chat from './components/chat';
import Map from '../../util/maps';
import OtherProfile from '../../util/otherProfile';
import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseConnect';
import { useRouter, useLocalSearchParams } from 'expo-router';

// chat tab match screen
const Match = () => {
    const router = useRouter();

    // modal states
    const [isMapVisible, setIsMapVisible] = useState(false);
    const [isOtherProfileVisible, setIsOtherProfileVisible] = useState(false);

    // keyboard state
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(null);

    // grabs match info from router params 
    const { userID, otherID, full_name, age, emoji, bio, occupation, location, time, images, imageOne, activated, matchID } = useLocalSearchParams();
    
    // other state
    const [avatar, setAvatar] = useState();

    // match states
    const [matchLocation, setMatchLocation] = useState('');
    const [matchTime, setMatchTime] = useState('');
    const [matchInitialRegion, setMatchInitialRegion] = useState({
        latitudeDelta: 0.001,
        longitudeDelta: 0.002,
    });

    // grabs business from db, formats local time, and updates match states
    // grabs others first image from storage and sets avatar state
    // creates a keyboard visibility listener
    useEffect(() => {
        (async () => {
            // grabs business from db and sets state
            const businessResponse = await supabase.from('businesses').select().eq('id', location);
            if (businessResponse.data[0]) {
                setMatchLocation(businessResponse.data[0].name);
                setMatchInitialRegion({...matchInitialRegion, latitude: businessResponse.data[0].lat, longitude: businessResponse.data[0].lon});
                
                // formats local time using timezone and sets state
                const localTime = new Date(parseInt(time));
                localTime.setHours(localTime.getHours() + parseInt(businessResponse.data[0].timezone));
                setMatchTime(localTime.toLocaleString('en-US', {timeZone: 'UTC'}));
            } else if (businessResponse.error) {
                // errorToast(businessResponse.error.message);
            }

            // grabs others first image from storage and sets avatar state
            const expirationSeconds = 10;
            const { data, error } = await supabase.storage.from('avatars').createSignedUrl(imageOne, expirationSeconds);
            if (data) {
                setAvatar(data.signedUrl);
            } else if (error) {
                // errorToast(error.message);
            }

            // listeners for keyboard visibility that set isKeyboardVisible state
            const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
                setIsKeyboardVisible(true);
            })
            const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
                setIsKeyboardVisible(false);
            })
            return () => {
                showSubscription.remove();
                hideSubscription.remove();
            }
        })()
    },[])

    // creates other object for detailed profile modal
    const other = {
        full_name,
        age,
        emoji,
        bio,
        occupation,
        location: matchLocation,
        time: matchTime,
        images: images.split(',').filter(image => image !== '')
    }

    // shortens business name to 23 chars for previewing in card
    const validateLocation = (location) => {
        if (location.length > 23) {
            return location.slice(0, 20) + '...';
        } else {
            return location;
        }
    }

    return (
        <RootSiblingParent>
        <ImageBackground imageStyle={{opacity: 0.3}} style={{height: globalDimensions.screenHeight}} source={require('../../../assets/TrilliumBackground.png')}>
            <SafeAreaView style={globalStyles.androidSafe}>
                <View style={{...globalStyles.container, marginTop: 0}}>
                    {/* modals */}
                    <Map isVisible={isMapVisible} onClose={()=>{setIsMapVisible(false)}} location={matchLocation} time={matchTime} initialRegion={matchInitialRegion}/>
                    <OtherProfile isVisible={isOtherProfileVisible} onClose={()=>{setIsOtherProfileVisible(false)}} user={other}/>
                    {/* back header */}
                    <View style={styles.headerContainer}>
                        <Ionicons style={{position: 'absolute', left: 0}} name="chevron-back" size={globalSizes.xl} color={globalColors.darkPrimary} onPress={()=>{router.back()}}/>
                    </View>
                    {/* match information header */}
                    <View style={styles.infoContainer}>
                        <View style={styles.circleImageBorder}>
                            {/* image - pressing opens detailed profile modal */}
                            <Pressable onPress={()=>{setIsOtherProfileVisible(true)}} style={{...styles.infoImage, overflow: 'hidden'}}>
                                <Image style={styles.infoImage} source={{uri: avatar}}/>
                            </Pressable>
                        </View>
                        <View style={{rowGap: 6}}>
                            <Text style={{...globalStyles.fontMediumBold, color: globalColors.darkNeutral}}>{full_name} {emoji}</Text>
                            {/* location and time - pressing opens map modal */}
                            <Pressable onPress={()=>{setIsMapVisible(true)}} style={styles.locationCard}>
                                <View style={styles.iconText}>
                                    <FontAwesome name="location-arrow" size={globalSizes.small} color={globalColors.secondary} />
                                    <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{...globalStyles.fontSmallBold, color: globalColors.darkPrimary}}>{validateLocation(matchLocation)}</Text>
                                </View>
                                <Text numberOfLines={1} style={{...globalStyles.fontSmall, color: globalColors.primary}}>@ {matchTime}</Text>
                            </Pressable>
                        </View>
                    </View>
                    <View style={{flex: 1, marginTop: 10, width: '100%', marginBottom: (isKeyboardVisible && Platform.OS === 'ios') ? -30 : 0}}>
                        {/* chat component */}
                        <Chat matchID={matchID} activated={activated} userID={userID} other={{
                            ID: otherID,
                            full_name: full_name,
                            avatar: avatar,
                        }}/> 
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
        </RootSiblingParent>
    )
}

const styles = StyleSheet.create({
    iconText: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 6,
    },    
    headerContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: globalSizes.xl,
        marginBottom: 10
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 16,
        width: '100%',
    },
    locationCard: {
        ...globalStyles.boxShadows,
        backgroundColor: 'white',
        paddingVertical: 4,
        paddingHorizontal: 6,
        borderRadius: 10,
        // maxWidth: '86%'
    },
    infoImage: {
        backgroundColor:'grey',
        height: 96,
        width: 96,
        borderRadius: 48,
    },
    circleImageBorder: {
        ...globalStyles.boxShadows,
        height: 106,
        width: 106,
        borderRadius: 53,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    }
})

export default Match;