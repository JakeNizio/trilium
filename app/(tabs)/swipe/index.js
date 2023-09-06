import { globalStyles, globalDimensions, globalSizes, globalColors } from '../../../globalDesign'
import { SafeAreaView, View, Pressable, Image, Text, StyleSheet, ImageBackground, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import LogoMain from '../../../components/logoMain';
import LoadingIndicator from '../../../components/loadingIndicator';
import { RootSiblingParent } from 'react-native-root-siblings';
import { getAgeFromBirthday, errorToast } from '../../../utilities';
import Map from '../../util/maps';
import OtherProfile from '../../util/otherProfile';
import Instructions from '../../util/instructions'
import AsyncStorage from "@react-native-async-storage/async-storage";
import GestureRecognizer from 'react-native-swipe-gestures';
import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseConnect';
import { useLocalSearchParams } from 'expo-router'

// swipe tab base screen
const Swipe = () => {
    
    // user state
    const [userID, setUserID] = useState(null);
    const [userColumn, setUserColumn] = useState(null);

    // other state
    const [otherID, setOtherID] = useState(null);
    const [otherData, setOtherData] = useState(null);
    const [otherName, setOtherName] = useState(null);
    const [otherEmoji, setOtherEmoji] = useState(null);
    const [otherBio, setOtherBio] = useState(null);
    const [otherOccupation, setOtherOccupation] = useState(null);
    const [otherImages, setOtherImages] = useState(null);
    const [otherAge, setOtherAge] = useState(null);
    const [otherDecision, setOtherDecision] = useState(null);

    // match state
    const [potmatchID, setPotmatchID] = useState(null);
    const [potmatchTime, setPotmatchTime] = useState(null);
    const [potmatchLocation, setPotmatchLocation] = useState(null);
    const [potmatchInitialRegion, setPotmatchInitialRegion] = useState({
        latitudeDelta: 0.001,
        longitudeDelta: 0.002,
    });

    // screen state
    const [isLoading, setIsLoading] = useState(false);
    const [isMapVisible, setIsMapVisible] = useState(false);
    const [isOtherProfileVisible, setIsOtherProfileVisible] = useState(false);
    const [isInstructionsVisible, setIsInstructionsVisible] = useState(false);

    const { instructions } = useLocalSearchParams();
    useEffect(() => {
        if (instructions === 'true') {
            setIsInstructionsVisible(true);
        } else {
            setIsInstructionsVisible(false);
        }
    }, [])
    
    // grabs user_id, a potmatch from db, others profile and stores all the data in state
    useEffect(() => {
        // grabs user_id
        if (!userID) {
            (async () => {
                const response = await AsyncStorage.getItem('user');
                const user = JSON.parse(response);
                setUserID(user?.id);
            })()
        }

        // grabs potmatch
        if (userID && !otherID) {
            (async () => {
                const { data, error } = await supabase.from('potmatches').select().or(`and(user_one.eq.${userID},decision_one.is.null), and(user_two.eq.${userID},decision_two.is.null)`).eq('activated', true).limit(1);
                if (data) {
                    if (data.length > 0) {
                        // set match state
                        setPotmatchID(data[0].id);

                        // grabs business from db and sets state
                        const businessResponse = await supabase.from('businesses').select().eq('id', data[0].business);
                        if (businessResponse.data[0]) {
                            setPotmatchLocation(businessResponse.data[0].name);
                            setPotmatchInitialRegion({...potmatchInitialRegion, latitude: businessResponse.data[0].lat, longitude: businessResponse.data[0].lon});
                            
                            // formats local time using timezone and sets state
                            const localTime = new Date(data[0].meeting_time);
                            localTime.setHours(localTime.getHours() + parseInt(businessResponse.data[0].timezone));
                            setPotmatchTime(localTime.toLocaleString('en-US', {timeZone: 'UTC'}));
                        } else if (businessResponse.error) {
                            errorToast(businessResponse.error.message);
                        }

                        // set user and other state
                        if (data[0].user_one !== userID) {
                            setUserColumn('decision_two');
                            setOtherDecision(data[0].decision_one);
                            setOtherID(data[0].user_one);
                        } else if (data[0].user_one === userID) {
                            setUserColumn('decision_one');
                            setOtherDecision(data[0].decision_two);
                            setOtherID(data[0].user_two);
                        }
  
                    } else {
                        setIsLoading(false);
                    }
                } else if (error) {
                    errorToast(error.message);
                }
            })()
        }

        // grabs other profile
        if (otherID && !otherData) {
            (async () => {
                const { data, error } = await supabase.from('profiles').select().eq('id', otherID);
                if (data) {
                    // set other state
                    setOtherName(data[0].full_name);
                    setOtherEmoji(data[0].emoji);
                    setOtherBio(data[0].bio);
                    setOtherOccupation(data[0].occupation);

                    const years = getAgeFromBirthday(data[0].birthday);
                    setOtherAge(years);

                    const imgs = [];
                    if (data[0].imageOne) imgs.push(data[0].imageOne);
                    if (data[0].imageTwo) imgs.push(data[0].imageTwo);
                    if (data[0].imageThree) imgs.push(data[0].imageThree);
                    if (data[0].imageFour) imgs.push(data[0].imageFour);
                    setOtherImages(imgs);

                    setOtherData(true);
                } else if (error) {
                    errorToast(error.message);
                }
            })()
        }
        if (!userID || !otherID || !otherData) {
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }
    },[userID, otherID, otherData])

    // resets state
    const resetState = () => {
        setUserColumn();

        setOtherID();
        setOtherData();
        setOtherName();
        setOtherEmoji();
        setOtherBio();
        setOtherOccupation();
        setOtherImages();
        setOtherAge();
        setOtherDecision();

        setPotmatchID();
        setPotmatchTime();
        setPotmatchLocation();
        setPotmatchInitialRegion({
            latitudeDelta: 0.001,
            longitudeDelta: 0.002,
        });
    }

    // left swipe updates db with skip and then resets state
    const leftSwipe = () => {
        (async () => {
            const { error } = await supabase.from('potmatches').update({[userColumn]: false}).eq('id', potmatchID);
            if (error) {
                errorToast(error.message);
            }
        })()

        resetState();
    }

    // right swipe updates db with like, signals matches, and then resets state
    const rightSwipe = () => {
        (async () => {
            const { error } = await supabase.from('potmatches').update({[userColumn]: true}).eq('id', potmatchID);
            if (error) {
                errorToast(error.message);
            }
        })()
        if (otherDecision === true) {
            Alert.alert('Match!');
        }

        resetState();
    }

    // converts path from profile to an image from storage and returns a large image card
    const GenerateImageFromID = ({ imageID }) => {
        const [img, setImg] = useState();
        (async () => {
            const expirationSeconds = 30;
            const { data, error } = await supabase.storage.from('avatars').createSignedUrl(imageID, expirationSeconds);
            if (data) {
                setImg(data.signedUrl);
            } else if (error) {
                // errorToast(error.message);
            }
        })()
        return (
            <View style={styles.imageCard}>
                <View style={{...globalStyles.imageCardLarge, overflow: 'hidden'}}>
                    <Image source={{uri: img}} style={globalStyles.imageCardLarge}/>
                </View>
            </View>
        )
    }

    return (
        <RootSiblingParent>
        <ImageBackground imageStyle={{opacity: 0.3}} style={{height: '100%'}} source={require('../../../assets/TrilliumBackground.png')}>
            <SafeAreaView style={globalStyles.androidSafe}>
                {/* modals */}
                <Map 
                    isVisible={isMapVisible}
                    onClose={()=>{setIsMapVisible(false)}}
                    location={potmatchLocation}
                    time={potmatchTime}
                    initialRegion={potmatchInitialRegion}
                />
                <OtherProfile
                    isVisible={isOtherProfileVisible}
                    onClose={()=>{setIsOtherProfileVisible(false)}}
                    user={{
                        full_name: otherName,
                        age: otherAge,
                        emoji: otherEmoji,
                        bio: otherBio,
                        occupation: otherOccupation,
                        location: potmatchLocation,
                        time: potmatchTime,
                        images: otherImages
                    }}
                />
                <Instructions
                    isVisible={isInstructionsVisible}
                    onClose={()=>{setIsInstructionsVisible(false)}}
                />
                {/* logo header */}
                <View style={globalStyles.logoHeader}>
                    <LogoMain/>
                </View>

                {/* check loading and display indicator */}
                {isLoading ? <LoadingIndicator/>
                :
                // no other data then show no new profiles    
                !otherData ? 
                <View style={globalStyles.container}>
                    <Text style={{...globalStyles.fontMediumBold, color: globalColors.neutral, alignSelf: 'center'}}>No New Profiles</Text>
                </View>
                // else show other profile
                :
                <View style={{...globalStyles.container, rowGap: 12}}>
                    {otherImages &&
                    // show profile card if images have been pulled
                    <GestureRecognizer onSwipeRight={()=>rightSwipe()} onSwipeLeft={()=>leftSwipe()}>
                        {/* press opens profile modal */}
                        <Pressable onPress={()=>{setIsOtherProfileVisible(true)}}> 
                            <GenerateImageFromID imageID={otherImages[0]}/>
                            <Text style={styles.imageText}>{otherName}, {otherAge} {otherEmoji}</Text>
                        </Pressable>
                    </GestureRecognizer>
                    }
                    <View style={{marginLeft: globalDimensions.marginOne, width: globalStyles.imageCardLarge.width, maxWidth: globalStyles.imageCardLarge.maxWidth}}>
                        <Text style={{...globalStyles.fontSmall, color: globalColors.darkNeutral}}>You met at: </Text>
                    </View>
                    {/* location card - press opens map modal */}
                    <Pressable onPress={()=>{setIsMapVisible(true)}} style={styles.locationCard}>
                        <View style={styles.iconText}>
                            <FontAwesome name="location-arrow" size={globalSizes.large} color={globalColors.secondary} />
                            <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{...globalStyles.fontMediumBold, color: globalColors.darkPrimary, marginRight: 14}}>{potmatchLocation}</Text>
                        </View>
                        <Text style={{...globalStyles.fontMedium, color: globalColors.primary}}>@ {potmatchTime}</Text>
                    </Pressable>
                </View>
                }
            </SafeAreaView>
        </ImageBackground>
        </RootSiblingParent>
    )
}

const styles = StyleSheet.create({
    imageText : {
        position: 'absolute',
        bottom: 14,
        left: 24,
        color: 'white',
        textShadowColor: 'black',
        textShadowRadius: 2,
        textShadowOffset: {
            width: 1,
            height: 1,
        },
        ...globalStyles.fontLargeBold,
        marginRight: 40
    },
    imageCard: {
        ...globalStyles.imageCardLarge,
        ...globalStyles.boxShadows,
    },
    locationCard: {
        // width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        ...globalStyles.boxShadows,
        backgroundColor: 'white',
        width: globalStyles.imageCardLarge.width,
        maxWidth: globalStyles.imageCardLarge.maxWidth
    },
    iconText: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 8,
        // paddingRight: 10
    },
})

export default Swipe;