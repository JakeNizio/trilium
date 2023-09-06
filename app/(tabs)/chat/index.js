import { globalStyles, globalColors } from '../../../globalDesign';
import { SafeAreaView, View, Text, ImageBackground } from 'react-native';
import { RootSiblingParent } from 'react-native-root-siblings';
import { errorToast } from '../../../utilities'
import LogoMain from '../../../components/logoMain';
import LoadingIndicator from '../../../components/loadingIndicator';
import NewMatches from './components/newMatches';
import Matches from './components/matches';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseConnect';
import { useIsFocused } from '@react-navigation/native';

// chat tab base screen
const Chat = () => {
    const isFocused = useIsFocused();

    // user state
    const [userID, setUserID] = useState(null);
    const [userActiveMatches, setUserActiveMatches] = useState(null);
    const [userNewMatches, setUserNewMatches] = useState(null);
    
    // screen state
    const [isLoading, setIsLoading] = useState(true);

    // resets user match states on focus
    useEffect(() => {
        setUserActiveMatches();
        setUserNewMatches();
    }, [isFocused])

    // grabs user_id and then grabs matches from db and sorts them according to activation
    useEffect(() => {
        // gets user_id
        if (!userID) {
            (async () => {
                const response = await AsyncStorage.getItem('user');
                const user = JSON.parse(response);
                setUserID(user?.id);
            })()
        }

        // get users matches from db and sorts into active and new
        if (userID && !userActiveMatches && !userNewMatches) {
            (async () => {
                // gets matches from db
                const { data, error } = await supabase.from('matches').select().or(`user_one.eq.${userID},user_two.eq.${userID}`);
                if (data) {
                    // sorts matches into active and new
                    if (data.length > 0) {
                        const activeMatches = [];
                        const newMatches = [];
                        data.map(item => {
                            // variables for each match
                            const otherID = (item.user_one === userID) ? item.user_two : item.user_one;
                            const matchID = item.id;
                            const location = item.business;
                            const time = item.meeting_time;

                            // sorts match based on whether it is activated
                            if (item.activated) {
                                activeMatches.push([otherID, matchID, location, time]);
                            } else {
                                newMatches.push([otherID, matchID, location, time]);
                            }
                        })

                        // sets user match states
                        if (activeMatches.length > 0) setUserActiveMatches(activeMatches);
                        if (newMatches.length > 0) setUserNewMatches(newMatches);
                    }
                    setIsLoading(false);
                } else if (error) {
                    errorToast(error.message);
                }
            })()
        }
    },[userID, userActiveMatches, userNewMatches])

    return (
        <RootSiblingParent>
            <ImageBackground imageStyle={{opacity: 0.3}} style={{height: '100%'}} resizeMode='cover' source={require('../../../assets/TrilliumBackground.png')}>
                <SafeAreaView style={globalStyles.androidSafe}>
                    {/* logo header */}
                    <View style={globalStyles.logoHeader}>
                        <LogoMain/>
                    </View>
                    {isLoading ? <LoadingIndicator/> : 
                    <View style={{...globalStyles.container, rowGap: 10}}>
                        {/* if new matches then show */}
                        {userNewMatches &&
                        <View style={{width: '100%', rowGap: 10}}>
                            <Text style={{...globalStyles.fontMediumBold, color: globalColors.darkPrimary}}>New Matches</Text>
                            <NewMatches userID={userID} matches={userNewMatches}/>
                        </View>
                        }
                        {/* if active matches then show */}
                        {userActiveMatches &&
                        <View style={{width: '100%', rowGap: 10, flex: 1}}>
                            <Text style={{...globalStyles.fontMediumBold, color: globalColors.darkPrimary}}>Matches</Text>
                            <Matches userID={userID} matches={userActiveMatches}/>
                        </View>
                        }
                        {/* if no matches then show */}
                        {(!userActiveMatches && !userNewMatches) &&
                            <Text style={{...globalStyles.fontMediumBold, color: globalColors.neutral}}>No Matches</Text>
                        }
                    </View>
                    }
                </SafeAreaView>
            </ImageBackground>
        </RootSiblingParent>
    )  
}

export default Chat;