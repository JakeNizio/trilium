import { ImageBackground, View, SafeAreaView, Text, StyleSheet } from 'react-native';
import { globalStyles, globalSizes, globalDimensions, globalColors } from '../../../globalDesign';
import MapView, { Marker, Heatmap } from 'react-native-maps';
import LoadingIndicator from '../../../components/loadingIndicator'
import LogoMain from '../../../components/logoMain'
import { RootSiblingParent } from 'react-native-root-siblings';
import { errorToast } from '../../../utilities';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../supabaseConnect'

// tonight tab base screen
const Tonight = () => {
    const mapRef = useRef(null);

    // user state
    const [userID, setUserID] = useState(null);
    const [userLocation, setUserLocation] = useState({
        latitude: 0,
        longitude: 0
    });

    // map state
    const [initialRegion, setInitialRegion] = useState({
        latitudeDelta: 0.03,
        longitudeDelta: 0.02,
    });
    const [heatPoints, setHeatPoints] = useState(null);

    // screen state
    const [isLoading, setIsLoading] = useState(true)

    // grabs user info from local storage
    useEffect(() => {
        (async () => {
            const response = await AsyncStorage.getItem('user');
            const user = JSON.parse(response);
            if (user?.id) {
                setUserID(user.id);
            }
        })()
    },[])

    // gets initial region and stores in state,
    // gets user location and stores in state on a 10 second interval
    useEffect(() => {
        (async () => {
            const response = await AsyncStorage.getItem('savedLocations');
            const location = JSON.parse(response);
            setInitialRegion({...initialRegion, latitude: location?.averages.lat, longitude: location?.averages.lon});
            setUserLocation({
                latitude: location?.averages.lat,
                longitude: location?.averages.lon,
            });
            // grabs location from local storage on 10 second interval
            const timeInterval = 10000;
            const timedLocationUpdate = setInterval( async () => {
                const response = await AsyncStorage.getItem('savedLocations');
                const location = JSON.parse(response);
                setUserLocation({
                    latitude: location?.averages.lat,
                    longitude: location?.averages.lon,
                });
            }, timeInterval)
            setIsLoading(false);
            return () => clearInterval(timedLocationUpdate);
        })()
    }, [])

     // gets active businesses within mapview and stores them in heatPoints state
    const updateActivity = async () => {
        // uses map boundaries to get all location entries from db within the bounds
        const { southWest, northEast } = await mapRef.current.getMapBoundaries();
        const { data, error } = await supabase.from('locations').select()
            .filter('departureTime','is',null)
            .gt('lat',southWest.latitude)
            .lt('lat', northEast.latitude)
            .lt('lon', northEast.longitude)
            .gt('lon', southWest.longitude)
        if (data[0]) {
            // removes the users location from entries and formats points for heatmap
            const cleanData = data.filter(point => point.user !== userID);
            const activityPoints = cleanData.map(point => ({
                latitude: point.lat,
                longitude: point.lon,
                weight: 1
            }));
            setHeatPoints(activityPoints);
        }
        if (error) errorToast(error.message);
    }

    return (
        <RootSiblingParent>
            <ImageBackground imageStyle={{opacity: 0.3}} style={{height: '100%'}} source={require('../../../assets/TrilliumBackground.png')}>
                <SafeAreaView style={globalStyles.androidSafe}>
                    {/* logo header */}
                    <View style={globalStyles.logoHeader}>
                        <LogoMain/>
                    </View>
                    <View style={{...globalStyles.container, rowGap: 30}}>
                        {isLoading ? <LoadingIndicator/>
                        :
                        <>
                        <View style={{alignItems: 'center'}}>
                            <Text style={{...globalStyles.fontLarge, color: globalColors.primary}}>Trillie Map 🌍</Text>
                            <Text style={{...globalStyles.fontSmall, color: globalColors.secondary}}>Your match could be nearby</Text>
                        </View>
                        {/* conditional heatmap and marker */}
                        <View style={{...globalStyles.imageCardLarge, ...globalStyles.boxShadows}}>
                            <View style={{...globalStyles.imageCardLarge, overflow: 'hidden'}}>
                                <MapView provider={'google'} ref={mapRef} initialRegion={initialRegion} style={globalStyles.imageCardLarge} onRegionChangeComplete={()=>updateActivity()} onMapReady={()=>{updateActivity()}}>
                                    {/* applies heat map if points within bounds have been found */}
                                    {(heatPoints?.length > 0) &&
                                    <Heatmap points={heatPoints} radius={50} gradient={{
                                        colors: ['red', 'yellow', 'green'],
                                        startPoints: [0.1, 0.85, 0.95],
                                    }}/>
                                    }
                                    <Marker coordinate={userLocation} pinColor={globalColors.secondary}/>
                                </MapView> 
                            </View>
                        </View>
                        </>
                        }
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </RootSiblingParent>
    )
}

export default Tonight;