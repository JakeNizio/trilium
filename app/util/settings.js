import { globalStyles, globalDimensions, globalSizes, globalColors } from '../../globalDesign';
import { Pressable, Alert, Modal, Text, View, SafeAreaView, StyleSheet, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { errorToast } from '../../utilities'
import ProfileInputDropdown from './components/profileInputDropdown'
import ChangePassword from './changePassword'
import Instructions from './instructions'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from 'react'
import { supabase } from '../../supabaseConnect'
import { useRouter } from 'expo-router';

// settings modal for profile screen
const Settings = ({isVisible, onClose, gender, preference, userID}) => {
    const router = useRouter();

    // screen state
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [isInstructionsVisible, setIsInstructionsVisible] = useState(false);

    // dropdown values
    const genderItems = [
        {label: 'Male', value: 'male'},
        {label: 'Female', value: 'female'},
        // {label: 'Male + Female', value: 'bi'},
        {label: 'Other', value: 'other'}
    ]
    const preferenceItems = [
        {label: 'Male', value: 'male'},
        {label: 'Female', value: 'female'},
        {label: 'Male + Female', value: 'bi'},
        {label: 'Other', value: 'other'}
    ]

    // logout function
    const onLogout = async () => {
        Alert.alert('Logout?', '', [
            {
                text: 'Yes',
                onPress: async () => {
                    const { error } = await supabase.auth.signOut();
        
                    if (error) {
                        errorToast(error.message);
                    } else {
                        await AsyncStorage.removeItem('user');
                        router.replace('/login');
                    }
                }
            },
            {
                text: 'Cancel'
            }
        ])
        
    }

    // delete account function
    const onDelete = async () => {
        Alert.alert('Are you sure you want to delete your account?', 'All matches and data will be permanently deleted', [
            {
                text: 'Yes',
                onPress: async () => {
                    try {
                        await supabase.functions.invoke('user-self-deletion');
                    } catch (error) {
                        errorToast(error.message);
                    } finally {
                        const { error } = await supabase.auth.signOut();
                        if (error) {
                            errorToast(error.message);
                        } else {
                            await AsyncStorage.removeItem('user');
                            router.replace('/login');
                        }
                    }
                }
            },
            {
                text: 'Cancel'
            }
        ])
    }

    // change gender function
    const onChangeGender = async (gender) => {
        const { error } = await supabase.from('profiles').update({gender: gender}).eq('id', userID);
        if (error) {
            console.error(error);
        }
    }

    // change preference function
    const onChangePreference = async (preference) => {
        const { error } = await supabase.from('profiles').update({preference: preference}).eq('id', userID);
        if (error) {
            console.error(error);
        }
    }
    
    return (
        <Modal animationType='slide' visible={isVisible}>
            {/* modals */}
            <ChangePassword isVisible={isPasswordModalVisible} onClose={()=>setIsPasswordModalVisible(false)}/>
            <Instructions isVisible={isInstructionsVisible} onClose={()=>setIsInstructionsVisible(false)}/>
            <ImageBackground imageStyle={{opacity: 0.3}} style={{height: globalDimensions.screenHeight}} source={require('../../assets/TrilliumBackground.png')}>
                <SafeAreaView style={{...globalStyles.androidSafe}}>
                    <View style={{...globalStyles.container, rowGap: 30}}>
                        {/* header */}
                        <View style={styles.headerContainer}>
                            <Ionicons style={{position: 'absolute', left: 0}} name="chevron-back" size={globalSizes.xl} color={globalColors.darkPrimary} onPress={onClose}/>
                            <Text style={{...globalStyles.fontMediumBold, color: globalColors.primary}}>Settings</Text>
                            <Ionicons style={{position: 'absolute', right: 0}} name="information-circle" size={globalSizes.large} color={globalColors.secondary} onPress={()=>setIsInstructionsVisible(true)}/>
                        </View>

                        {/* gender and preference dropdowns */}
                        <ProfileInputDropdown title={'Gender'} value={gender.userGender} setValue={gender.setUserGender} items={genderItems} onChange={onChangeGender}/>
                        <ProfileInputDropdown title={'Preference'} value={preference.userPreference} setValue={preference.setUserPreference} items={preferenceItems} onChange={onChangePreference}/>

                        {/* logout button */}
                        <Pressable style={styles.logoutButton} onPress={()=>{onLogout()}}>
                            <Text style={{...globalStyles.fontMedium, color: 'white'}}>Logout</Text>
                        </Pressable>

                        {/* open change password modal */}
                        <Text style={{...globalStyles.fontSmall, color: globalColors.secondary}} onPress={()=>{setIsPasswordModalVisible(true)}}>Change Password</Text>

                        {/* delete account button */}
                        <Text style={{...globalStyles.fontMini, color: globalColors.error}} onPress={()=>onDelete()}>Delete Account</Text>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </Modal>
    )
}

const styles = StyleSheet.create({
    headerContainer: {
        width: '100%',
        // marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: globalSizes.xl
    },
    logoutButton: {
        ...globalStyles.boxShadows,
        alignItems: 'center',
        marginTop: 12,
        width: '100%',
        padding: 14,
        borderRadius: 12,
        backgroundColor: globalColors.primary,
    },
})

export default Settings;