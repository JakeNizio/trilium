import { globalStyles, globalColors, globalDimensions } from '../../globalDesign';
import { Alert, Pressable, SafeAreaView, Text, TextInput, View, ImageBackground, StyleSheet } from 'react-native';
import LogoMain from '../../components/logoMain';
import { RootSiblingParent } from 'react-native-root-siblings';
import { errorToast, validatePassword, validateEmail } from '../../utilities'
import { useState } from 'react';
import { supabase } from '../../supabaseConnect';
import { useRouter } from 'expo-router';

const Signup = () => {
    const router = useRouter();

    // user state
    const [fullname, setFullname] = useState(null);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState(null);

    // validation state
    const [hasValidName, setHasValidName] = useState(true);
    const [hasValidEmail, setHasValidEmail] = useState(true);
    const [hasValidPassword, setHasValidPassword] = useState(true);
    const [hasMatchingPasswords, setHasMatchingPasswords] = useState(true);

    // validates user info and creates a new account
    const onSignUp = async () => {
        // resets validation state
        setHasValidName(true);
        setHasValidEmail(true);
        setHasValidPassword(true);
        setHasMatchingPasswords(true);
        let validated = true;
        
        // validates user state
        if (fullname === '') {
            setHasValidName(false);
            validated = false;
        }
        if (!validateEmail(email)) {
            setHasValidEmail(false);
            validated = false;
        }
        if (!validatePassword(password)) {
            setHasValidPassword(false);
            validated = false;
        }
        if (!(password === confirmPassword)) {
            setHasMatchingPasswords(false);
            validated = false;
        }

        // creates a new user account
        if (validated) {
            try {
                // full name passed in as metadata and used in profile
                const { data, error } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            full_name: fullname
                        }
                    }
                })

                if (data.user?.identities?.length > 0) {
                    Alert.alert('Your account was created.', 'Sign in now to set up your profile!');
                    router.back();
                } else if (data.user?.identities?.length === 0) {
                    errorToast('Email already in use');
                }
                
                if (error) errorToast(error.message);

            } catch (e) {
                errorToast(e.message);
            }
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
                            <Text style={styles.titleFont}>Create Account</Text>

                            {/* name input */}
                            <View style={styles.inputField}>
                                <Text style={styles.inputNameFont}>Full Name:</Text>
                                {/* validation feedback in borderColor and in text below */}
                                <TextInput style={{...styles.inputBox, borderColor: hasValidName ? 'white' : globalColors.error}} placeholder='Enter name' value={fullname} onChangeText={newFullname => setFullname(newFullname)}/>
                                {!hasValidName &&
                                    <Text style={styles.fieldErrorFont}>Enter your full name</Text>
                                }
                            </View>

                            {/* email input */}
                            <View style={styles.inputField}>
                                <Text style={styles.inputNameFont}>Email:</Text>
                                {/* validation feedback in borderColor and in text below */}
                                <TextInput style={{...styles.inputBox, borderColor: hasValidEmail ? 'white' : globalColors.error}} inputMode='email' placeholder='Enter email' value={email} onChangeText={newEmail => setEmail(newEmail)}/>
                                {!hasValidEmail &&
                                    <Text style={styles.fieldErrorFont}>Enter a valid email address</Text>
                                }
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

                            {/* sign up button */}
                            <Pressable style={styles.createButton} onPress={()=>onSignUp()}>
                                <Text style={{...globalStyles.fontMedium, color: 'white'}}>Sign Up</Text>
                            </Pressable>
                        </View>

                        {/* redirect to login page */}
                        <View style={{flexDirection: 'row'}}>
                            <Text style={{...globalStyles.fontSmall, color: globalColors.neutral}} onPress={()=>router.back()}>Already have an account? </Text>
                            <Text style={{...globalStyles.fontSmall, color: globalColors.neutral, textDecorationLine: 'underline'}} onPress={()=>router.back()}>SIGN IN</Text>
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

export default Signup;