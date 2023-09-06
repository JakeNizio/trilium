import { globalStyles, globalColors, globalDimensions } from '../../globalDesign';
import { Pressable, SafeAreaView, Text, TextInput, View, ImageBackground, StyleSheet } from 'react-native';
import LogoMain from '../../components/logoMain';
import { RootSiblingParent } from 'react-native-root-siblings';
import { errorToast, notificationToast, validatePassword } from '../../utilities'
import { useState } from 'react';
import { supabase } from '../../supabaseConnect';
import { useRouter } from 'expo-router';

// auth page for password resetting
const ForgotPassword = () => {
    const router = useRouter();

    // password state
    const [password, setPassword] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState(null);

    // validation state
    const [hasValidPassword, setHasValidPassword] = useState(true);
    const [hasMatchingPasswords, setHasMatchingPasswords] = useState(true);
    
    // validates and updates password
    const onReset = async () => {
        // reset validation state
        setHasValidPassword(true);
        setHasMatchingPasswords(true);
        let validated = true;

        // validate passwords
        if (!validatePassword(password)) {
            setHasValidPassword(false);
            validated = false;
        }
        if (!(password === confirmPassword)) {
            setHasMatchingPasswords(false);
            validated = false;
        }

        // update password in db if valid
        if (validated) {
            const { data, error } = await supabase.auth.updateUser({ password: password })
            if (data) notificationToast("Password updated successfully!");
            if (error) errorToast(error.message);
        }
        
    }
    return (
        <RootSiblingParent>
            <ImageBackground imageStyle={{opacity: 0.3}} style={{height: '100%'}} resizeMode='cover' source={require('../../assets/TrilliumBackground.png')}>
                <SafeAreaView style={globalStyles.androidSafe}>
                    {/* logo header */}
                    <View style={globalStyles.logoHeader}>
                        <LogoMain/>
                    </View>
                    <View style={styles.container}>
                        <View style={styles.mainContent}>
                            <Text style={styles.titleFont}>Reset Your Password</Text>

                            {/* password input */}
                            <View style={styles.inputField}>
                                <Text style={styles.inputNameFont}>Password:</Text>
                                {/* validation feedback in borderColor and in text below */}
                                <TextInput style={{...styles.inputBox, borderColor: hasValidPassword ? 'white' : globalColors.error}} secureTextEntry={true} placeholder="Enter password" value={password} onChangeText={newPassword => setPassword(newPassword)}/>
                                {!hasValidPassword &&
                                    <Text style={styles.fieldErrorFont}>Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters</Text>
                                }
                            </View>

                            {/* confirm password input*/}
                            <View style={styles.inputField}>
                                <Text style={styles.inputNameFont}>Confirm Password:</Text>
                                {/* validation feedback in borderColor and in text below */}
                                <TextInput style={{...styles.inputBox, borderColor: hasMatchingPasswords ? 'white' : globalColors.error}} secureTextEntry={true} placeholder='Enter password' value={confirmPassword} onChangeText={newConfirmPassword => setConfirmPassword(newConfirmPassword)}/>
                                {!hasMatchingPasswords &&
                                    <Text style={styles.fieldErrorFont}>Passwords must match</Text>
                                }
                            </View>

                            {/* reset/update password button */}
                            <Pressable style={styles.createButton} onPress={()=>onReset()}>
                                <Text style={{...globalStyles.fontMedium, color: 'white'}}>Reset</Text>
                            </Pressable>
                        </View>

                        {/* redirect to login page */}
                        <View style={{flexDirection: 'row'}}>
                            <Text style={{...globalStyles.fontSmall, color: globalColors.neutral}} onPress={()=>router.push('/signup')}>Back to </Text>
                            <Text style={{...globalStyles.fontSmall, color: globalColors.neutral, textDecorationLine: 'underline'}} onPress={()=>router.push('/login')}>SIGN IN</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </RootSiblingParent>
    )
}

const styles = StyleSheet.create({
    container: {
        ...globalStyles.container,
        margin: globalDimensions.marginTwo,
    },
    mainContent: {
        flex: 1,
        rowGap: 16,
        alignItems: 'flex-start',
        width: '100%'
    },
    titleFont: {
        ...globalStyles.fontLargeBold,
        color: globalColors.darkPrimary,
        marginBottom: 10
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
    createButton: {
        ...globalStyles.boxShadows,
        alignItems: 'center',
        marginTop: 12,
        width: '100%',
        padding: 14,
        borderRadius: 12,
        backgroundColor: globalColors.primary,
    },
    fieldErrorFont: {
        ...globalStyles.fontMini,
        color: globalColors.error
    },
})

export default ForgotPassword;