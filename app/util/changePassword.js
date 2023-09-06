import { globalStyles, globalDimensions, globalSizes, globalColors } from '../../globalDesign';
import { Pressable, Alert, Modal, Text, View, SafeAreaView, StyleSheet, ImageBackground, TextInput } from 'react-native';
import { RootSiblingParent } from 'react-native-root-siblings';
import { errorToast, validatePassword } from '../../utilities'
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react'
import { supabase } from '../../supabaseConnect'

// change password modal for settings modal
const ChangePassword = ({isVisible, onClose}) => {
    // password state
    const [password, setPassword] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState(null);

    // validation state
    const [hasValidPassword, setHasValidPassword] = useState(true);
    const [hasMatchingPasswords, setHasMatchingPasswords] = useState(true);

    // validates password and updates password in db
    const onChangePassword = async () => {
        // resets validation state
        setHasValidPassword(true);
        setHasMatchingPasswords(true);
        let validated = true;
        
        // validates passwords
        if (!validatePassword(password)) {
            setHasValidPassword(false);
            validated = false;
        }
        if (!(password === confirmPassword)) {
            setHasMatchingPasswords(false);
            validated = false;
        }

        if (validated) {
            try {
                // updates password
                const { data, error } = await supabase.auth.updateUser({password: password});

                if (data.user) {
                    Alert.alert('Your password has been updated.');
                }
                
                if (error) errorToast(error.message);

            } catch (e) {
                errorToast(e.message);
            }
        }
    }

    return (
        <Modal animationType='slide' visible={isVisible}>
            <RootSiblingParent>
                <ImageBackground imageStyle={{opacity: 0.3}} style={{height: globalDimensions.screenHeight}} source={require('../../assets/TrilliumBackground.png')}>
                    <SafeAreaView style={{...globalStyles.androidSafe}}>
                        <View style={{...globalStyles.container, rowGap: 30}}>
                            {/* header */}
                            <View style={styles.headerContainer}>
                                <Ionicons style={{position: 'absolute', left: 0}} name="chevron-back" size={globalSizes.xl} color={globalColors.darkPrimary} onPress={onClose}/>
                                <Text style={{...globalStyles.fontMediumBold, color: globalColors.primary}}>Change Password</Text>
                            </View>

                            {/* password input */}
                            <View style={styles.inputField}>
                                <Text style={styles.inputNameFont}>Password:</Text>
                                {/* validation feedback in borderColor and in text below */}
                                <TextInput style={{...styles.inputBox, borderColor: hasValidPassword ? 'white' : globalColors.error}} secureTextEntry={true} placeholder="Enter password" value={password} onChangeText={newPassword => setPassword(newPassword)}/>
                                {!hasValidPassword &&
                                    <Text style={styles.fieldErrorFont}>Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters</Text>
                                }
                            </View>

                            {/* confirm password input */}
                            <View style={styles.inputField}>
                                <Text style={styles.inputNameFont}>Confirm Password:</Text>
                                {/* validation feedback in borderColor and in text below */}
                                <TextInput style={{...styles.inputBox, borderColor: hasMatchingPasswords ? 'white' : globalColors.error}} secureTextEntry={true} placeholder='Enter password' value={confirmPassword} onChangeText={newConfirmPassword => setConfirmPassword(newConfirmPassword)}/>
                                {!hasMatchingPasswords &&
                                    <Text style={styles.fieldErrorFont}>Passwords must match</Text>
                                }
                            </View>

                            {/* update password button */}
                            <Pressable style={styles.confirmButton} onPress={()=>{onChangePassword()}}>
                                <Text style={{...globalStyles.fontMedium, color: 'white'}}>Confirm</Text>
                            </Pressable>
                        </View>
                    </SafeAreaView>
                </ImageBackground>
            </RootSiblingParent>
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
    confirmButton: {
        ...globalStyles.boxShadows,
        alignItems: 'center',
        marginTop: 12,
        width: '100%',
        padding: 14,
        borderRadius: 12,
        backgroundColor: globalColors.primary,
    },
    inputField: {
        width: '100%',
        rowGap: 8,
    },
    inputNameFont: {
        ...globalStyles.fontSmallBold,
        color: globalColors.darkPrimary
    },
    inputBox: {
        ...globalStyles.boxShadows,
        ...globalStyles.fontSmall,
        width: '100%',
        padding: 10,
        borderRadius: 12,
        backgroundColor: 'white',
        color: globalColors.darkNeutral,
        borderWidth: 1,
        borderColor: 'white'
    },
    fieldErrorFont: {
        ...globalStyles.fontMini,
        color: globalColors.error
    },
})

export default ChangePassword;