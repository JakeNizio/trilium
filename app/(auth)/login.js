import { globalStyles, globalColors, globalDimensions } from '../../globalDesign';
import { Alert, Pressable, SafeAreaView, Text, TextInput, ImageBackground, View, StyleSheet } from 'react-native';
import LogoMain from '../../components/logoMain';
import { RootSiblingParent } from 'react-native-root-siblings';
import { errorToast, notificationToast } from '../../utilities'
import { AntDesign } from '@expo/vector-icons';
import { supabase } from '../../supabaseConnect';
import { useEffect, useState } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser'

// auth page for login
const Login = () => {
    const router = useRouter();
    
    // user login state
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);

    // validation state
    const [hasValidCredentials, setHasValidCredentials] = useState(true);

    // listens for url change and authenticates session if password recovery tokens recieved from password reset link
    const subscribeURL = (listener: (url: string) => void) => {
        // parses url and sets auth session
        const onReceiveURL = async ({ url }: { url: string }) => {
            const access_token = url.split('access_token=')[1].split('&')[0];
            const refresh_token = url.split('refresh_token=')[1].split('&')[0];
            const { data, error } = await supabase.auth.setSession({
                access_token: access_token,
                refresh_token: refresh_token
            })
            if (data) {
                // routes user to the forgotPassword page to create a new password
                router.replace({pathname: '/forgotPassword'});
            }
            if (error) errorToast(error.message);
            
            listener(url);
        };
        
        // listener with onRecieveURL callback
        const subscription = Linking.addEventListener("url", onReceiveURL);

        // clears subscription on page exit
        return () => {
          subscription.remove();
        }
    }

    // starts url listener
    useEffect(() => {
        subscribeURL();
    }, [])

    // validates user login state and authenticates user
    const onLogin = async () => {
        // resets validation state
        setHasValidCredentials(true);

        // authenticates the user
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
    
            if (data.session !== null) {
                // grabs user info from local device storage and parses it
                var response = null;
                while (response === null) {
                    response = await AsyncStorage.getItem('user');
                }
                const user = JSON.parse(response);

                // routes users based on initialzation status
                if (user.initialized) {
                    router.replace({pathname: '/swipe'});
                } else {
                    router.replace({pathname: '/setup'});
                }
            } else {
                // if couldnt grab session then update validation state
                setHasValidCredentials(false);
            }
    
            if (error && (error.message !== 'Invalid login credentials')) errorToast(error.message);

        } catch (e) {
            errorToast(e.message);
        }
    }

    // OAuth login function
    // in development - working with ios, freezes android
    const onLoginWithOAuth = async (provider) => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider
        })
        if (data) {
            console.log(data) // clears
            console.log(error) // clears
            const d = await WebBrowser.openAuthSessionAsync(data.url)
            console.log(d) // does not reach on android
            if (d?.type === 'success') {
                const access_token = d.url.split('access_token=')[1].split('&')[0]
                const refresh_token = d.url.split('refresh_token=')[1].split('&')[0]
                const { data, error } = await supabase.auth.setSession({
                    access_token: access_token,
                    refresh_token: refresh_token
                })
                if (data) {
                    const userResponse = await supabase.from('profiles').select().eq('id', data.session.user.id)
                    if (userResponse.data) {
                        const json = JSON.stringify(userResponse.data[0])
                        await AsyncStorage.setItem('user', json)
                        if (userResponse.data[0].initialized === true) {
                            router.replace({pathname: '/swipe'})
                        } else {
                            router.replace({pathname: '/setup'})
                        }
                    } else if (userResponse.error) {
                        console.error(userResponse.error)
                    }
                }
                if (error) console.error(error)

            }
        }

        if (error) console.error(error)
    }

    // Sends password reset link to the email in user state
    const onForgotPassword = async () => {
        Alert.alert('Do you want to reset your password?', '', [
            {
                text: 'Yes',
                onPress: async () => {
                    // magic link back to this page
                    const resetPasswordURL = Linking.createURL('(auth)/login/');
                    // sends password reset email with a redirect using the magic link
                    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: resetPasswordURL,
                    })
                    if (error) {
                        errorToast(error.message);
                    } else {
                        notificationToast('Sending password reset to email');
                    }
                }
            },
            {
                text: 'Cancel'
            }
        ])
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
                            <Text style={styles.titleFont}>Welcome</Text>

                            {/* email input */}
                            <View style={styles.inputField}>
                                <Text style={styles.inputNameFont}>Email:</Text>
                                {/* validation feedback in borderColor */}
                                <TextInput style={{...styles.inputBox, borderColor: hasValidCredentials ? 'white' : globalColors.error}} placeholder='enter email' value={email} onChangeText={newEmail => setEmail(newEmail)}/>
                            </View>

                            {/* password input */}
                            <View style={styles.inputField}>
                                <Text style={styles.inputNameFont}>Password:</Text>
                                {/* validation feedback in borderColor */}
                                <TextInput style={{...styles.inputBox, borderColor: hasValidCredentials ? 'white' : globalColors.error}} secureTextEntry={true} placeholder='enter password' value={password} onChangeText={newPassword => setPassword(newPassword)}/>
                            </View>
                            {/* validation feedback */}
                            {!hasValidCredentials &&
                                <Text style={styles.fieldErrorFont}>Email and password don't match</Text>
                            }

                            {/* login button */}
                            <Pressable style={styles.loginButton} onPress={()=>onLogin()}>
                                <Text style={{...globalStyles.fontMedium, color: 'white'}}>Login</Text>
                            </Pressable>

                            {/* password reset button */}
                            <Text style={{...globalStyles.fontMini, color: globalColors.neutral, alignSelf: 'flex-end'}} onPress={()=>onForgotPassword()}>Forgot Password?</Text>

                            {/* OAuth - in development
                            <View style={{width: '100%', flexDirection: 'row', justifyContent: 'center', marginTop: 6}}>
                                <View style={{height:0, borderBottomWidth: 1, borderColor: globalColors.neutral, alignSelf: 'center', width: '40%', marginHorizontal: 8}}></View>
                                <View style={{paddingVertical: 0, paddingHorizontal: 6, borderRadius: 8, borderWidth: 1, borderColor: globalColors.neutral}}>
                                    <Text style={{...globalStyles.fontMini, color: globalColors.neutral}}>OR</Text>
                                </View>
                                <View style={{height:0, borderBottomWidth: 1, borderColor: globalColors.neutral, alignSelf: 'center', width: '40%', marginHorizontal: 8}}></View>
                            </View>

                            <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-evenly', marginTop: 14}}>
                                <Pressable style={styles.authCircle} onPress={()=>onLoginWithOAuth('google')}>
                                    <AntDesign name="google" size={34} color={globalColors.secondary} />
                                </Pressable>
                                <Pressable style={styles.authCircle} onPress={()=>onLoginWithOAuth('facebook')}>
                                    <AntDesign name="facebook-square" size={34} color={globalColors.secondary} />
                                </Pressable>
                                <Pressable style={styles.authCircle} onPress={()=>onLoginWithOAuth('twitter')}>
                                    <AntDesign name="twitter" size={34} color={globalColors.secondary} />
                                </Pressable>
                            </View> */}
                        </View>

                        {/* redirect to signup page */}
                        <View style={{flexDirection: 'row'}}>
                            <Text style={{...globalStyles.fontSmall, color: globalColors.neutral}} onPress={()=>router.push('/signup')}>Need an account? </Text>
                            <Text style={{...globalStyles.fontSmall, color: globalColors.neutral, textDecorationLine: 'underline'}} onPress={()=>router.push('/signup')}>SIGN UP</Text>
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
        rowGap: 8
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
    loginButton: {
        ...globalStyles.boxShadows,
        alignItems: 'center',
        marginTop: 12,
        width: '100%',
        padding: 14,
        borderRadius: 12,
        backgroundColor: globalColors.primary,
    },
    authCircle: {
        height: 60,
        width: 60,
        borderRadius: 30,
        borderWidth: 5,
        borderColor: globalColors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    fieldErrorFont: {
        ...globalStyles.fontMini,
        color: globalColors.error
    },
})

export default Login;