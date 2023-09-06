import { globalStyles, globalColors, globalSizes } from '../../../globalDesign';
import { SafeAreaView, View, StyleSheet, ImageBackground } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { RootSiblingParent } from 'react-native-root-siblings';
import { errorToast } from '../../../utilities'
import LogoMain from '../../../components/logoMain';
import LoadingIndicator from '../../../components/loadingIndicator';
import ProfileInputSmall from './components/profileInputSmall';
import ProfileInputLarge from './components/profileInputLarge';
import ImageModule from './components/imageModule';
import Settings from '../../util/settings';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseConnect';

// profile tab base screen
const Profile = () => {
    // user state
    const [userID, setUserID] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userName, setUserName] = useState(null);
    const [userEmoji, setUserEmoji] = useState(null);
    const [userBio, setUserBio] = useState(null);
    const [userOccupation, setUserOccupation] = useState(null);
    const [userGender, setUserGender] = useState(null);
    const [userPreference, setUserPreference] = useState(null);
    const [userImages, setUserImages] = useState(null);

    // screen state
    const [isLoading, setIsLoading] = useState(true);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [dragging, setDragging] = useState(false);

    // grabs user_id, user profile from db, and stores all the data in state
    useEffect(() => {
        // grabs user_id
        if (!userID) {
            (async () => {
                const response = await AsyncStorage.getItem('user');
                const user = JSON.parse(response);
                setUserID(user?.id);
            })()
        }

        // grabs user data from profile db
        if (userID && !userData) {
            (async () => {
                const { data, error } = await supabase.from('profiles').select().eq('id', userID);
                if (data) {
                    // sets user state
                    setUserName(data[0].full_name);
                    setUserGender(data[0].gender);
                    setUserPreference(data[0].preference)
                    setUserEmoji(data[0].emoji);
                    setUserBio(data[0].bio);
                    setUserOccupation(data[0].occupation);
                    const imgs = [];
                    if (data[0].imageOne) imgs.push(data[0].imageOne);
                    if (data[0].imageTwo) imgs.push(data[0].imageTwo);
                    if (data[0].imageThree) imgs.push(data[0].imageThree);
                    if (data[0].imageFour) imgs.push(data[0].imageFour);
                    (async () => {
                        if (imgs.length > 0) {
                            const expirationSeconds = 10;
                            const { data, error } = await supabase.storage.from('avatars').createSignedUrls(imgs, expirationSeconds);
                            if (data) {
                                const urls = data.map((item,index) => ([imgs[index], item.signedUrl]));
                                setUserImages(urls);
                            } else if (error) {
                                console.error(error);
                            }
                        }
                    })()
                    setUserData(true);
                } else if (error) {
                    console.error(error);
                }
            })()
        }
        if (!userData && !userID) {
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }
    },[userID, userData])

    // updates name in db
    const onNameUpdate = async () => {
        const { error } = await supabase.from('profiles').update({full_name: userName}).eq('id', userID);
        if (error) {
            // errorToast(error.message);
        }
    }

    // updates emoji in db
    const onEmojiUpdate = async () => {
        const { error } = await supabase.from('profiles').update({emoji: userEmoji}).eq('id', userID);
        if (error) {
            // errorToast(error.message);
        }
    }

    // updates occupation in db
    const onOccupationUpdate = async () => {
        const { error } = await supabase.from('profiles').update({occupation: userOccupation}).eq('id', userID);
        if (error) {
            // errorToast(error.message);
        }
    }

    // updates bio in db
    const onBioUpdate = async () => {
        const { error } = await supabase.from('profiles').update({bio: userBio}).eq('id', userID);
        if (error) {
            // errorToast(error.message);
        }
    }

    return (
        <RootSiblingParent>
        <ImageBackground imageStyle={{opacity: 0.3}} style={{height: '100%'}} resizeMode='cover' source={require('../../../assets/TrilliumBackground.png')}>
            <SafeAreaView style={globalStyles.androidSafe}>
                {/* settings modal */}
                <Settings
                    isVisible={isSettingsVisible}
                    onClose={()=>{setIsSettingsVisible(false)}}
                    gender={{
                        userGender,
                        setUserGender
                    }}
                    preference={{
                        userPreference,
                        setUserPreference
                    }}
                    userID={userID}
                />
                {/* logo header */}
                <View style={globalStyles.logoHeader}>
                    <LogoMain/>
                    <View style={styles.headerRight}>
                        {/* pressing opens the setting modal */}
                        <Ionicons
                            onPress={()=>setIsSettingsVisible(true)}
                            name='settings-sharp'
                            color={globalColors.secondary}
                            size={globalSizes.large}
                        />
                    </View>
                </View>
                <KeyboardAwareScrollView enableAutomaticScroll={true} scrollEnabled={dragging ? false : true}>
                    {/* check for loading */}
                    { isLoading ? <LoadingIndicator/> :
                    // if not loading then show profile inputs
                    <View style={{...globalStyles.container, rowGap: 18}}>
                        <ProfileInputSmall title='Full Name' text={userName} setText={setUserName} onSubmit={onNameUpdate}/>
                        <ImageModule userID={userID} images={userImages} setImages={setUserImages} dragging={dragging} setDragging={setDragging}/>
                        <ProfileInputSmall title='Emoji' text={userEmoji} setText={setUserEmoji} onSubmit={onEmojiUpdate}/>
                        <ProfileInputSmall title='Occupation' text={userOccupation} setText={setUserOccupation} onSubmit={onOccupationUpdate}/>
                        <ProfileInputLarge title='Bio' text={userBio} setText={setUserBio} onSubmit={onBioUpdate}/>
                    </View>
                    }
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </ImageBackground>
        </RootSiblingParent>
    )
}

const styles = StyleSheet.create({
    headerRight: {
        position: 'absolute',
        right: 0,
        top:0,
        bottom: 0,
        justifyContent: 'center'
    }
})

export default Profile;