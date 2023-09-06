import { globalStyles, globalDimensions } from '../../globalDesign';
import { ImageBackground, StyleSheet } from 'react-native';
import { RootSiblingParent } from 'react-native-root-siblings';
import { errorToast } from '../../utilities'
import { useState } from 'react';
import { supabase } from '../../supabaseConnect';
import { useRouter } from 'expo-router';
import uuid from 'react-native-uuid';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Birthday from './modals/birthday'
import Gender from './modals/gender'
import Image from './modals/image'

// setup root page
const Setup = () => {
    const router = useRouter();

    // user state
    const [birthday, setBirthday] = useState(null);
    const [gender, setGender] = useState(null);
    const [preference, setPreference] = useState(null);
    const [image, setImage] = useState(null);
    
    // screen state
    const [isBirthdayVisible, setIsBirthdayVisible] = useState(true);
    const [isGenderVisible, setIsGenderVisible] = useState(false);
    const [isImageVisible, setIsImageVisible] = useState(false);

    // page managment
    const onBirthdayForward = () => {
        setIsBirthdayVisible(false);
        setIsGenderVisible(true);
        setIsImageVisible(false);
    }

    const onGenderBackward = () => {
        setIsBirthdayVisible(true);
        setIsGenderVisible(false);
        setIsImageVisible(false);
    }

    const onGenderForward = () => {
        setIsBirthdayVisible(false);
        setIsGenderVisible(false);
        setIsImageVisible(true);
    }

    const onImageBackward = () => {
        setIsBirthdayVisible(false);
        setIsGenderVisible(true);
        setIsImageVisible(false);
    }

    // submits all user state to db
    const onImageForward = async () => {
        // gets user info from local storage
        const response = await AsyncStorage.getItem('user');
        const user = JSON.parse(response);

        // uploads all images into db storage and stores paths
        const imageStoragePaths = await Promise.all(image.map(async (item, index) => {
            const pictureID = uuid.v4();
            const { data, error } = await supabase.storage.from('avatars').upload(pictureID, {uri: item}, {contentType: 'image/jpg'});
            if (data) {
                return data.path;
            }
            if (error) errorToast(error.message);
        }))

        // updates profile with user state and image paths
        const { error } = await supabase.from('profiles').update({
            initialized: true,
            birthday: birthday,
            gender: gender,
            preference: preference,
            imageOne: imageStoragePaths[0] ? imageStoragePaths[0] : null,
            imageTwo: imageStoragePaths[1] ? imageStoragePaths[1] : null,
            imageThree: imageStoragePaths[2] ? imageStoragePaths[2] : null,
            imageFour: imageStoragePaths[3] ? imageStoragePaths[3] : null,
        }).eq('id', user.id)

        if (error) {
            errorToast(error.message);
        } else {
            router.replace({pathname: '/swipe', params: { instructions: true }});
        }
    }

    return (
        <RootSiblingParent>
            <ImageBackground imageStyle={{opacity: 0.3}} style={{height: '100%'}} resizeMode='cover' source={require('../../assets/TrilliumBackground.png')}>
                    {/* unique info pages */}
                    <Birthday isVisible={isBirthdayVisible} onForward={onBirthdayForward} birthday={birthday} setBirthday={setBirthday}/>
                    <Gender isVisible={isGenderVisible} onForward={onGenderForward} onBackward={onGenderBackward} gender={gender} setGender={setGender} preference={preference} setPreference={setPreference}/>
                    <Image isVisible={isImageVisible} onForward={onImageForward} onBackward={onImageBackward} image={image} setImage={setImage}/>
            </ImageBackground>
        </RootSiblingParent>
    )
}

const styles = StyleSheet.create({
    container: {
        ...globalStyles.container,
        margin: globalDimensions.marginTwo,
    }
})

export default Setup;