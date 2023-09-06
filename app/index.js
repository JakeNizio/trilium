import { globalStyles } from '.././globalDesign'
import { getDistanceFromLatLonInKm } from "../utilities";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from 'react-native-uuid';
import { supabase } from "../supabaseConnect";
import { useRootNavigationState, useRouter } from 'expo-router'
import { SafeAreaView, Text } from "react-native";
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Device from 'expo-device';
import { getInitialURL } from 'expo-linking';

const Index = () => {
    const navigationState = useRootNavigationState(); 
    const router = useRouter();
    
    // checks for auth, if valid then stores the user_id on the device and routes to tabs
    // else routes to login screen to get auth
    useEffect(()=>{    
        if (!navigationState?.key) return;

        supabase.auth.onAuthStateChange((event, session) => {
            // console.log(event, session);
            if (event === 'SIGNED_IN' || session !== null) {
                (async () => {
                    const { data, error } = await supabase.from('profiles').select().eq('id', session.user.id);
                    if (data) {
                        const json = JSON.stringify(data[0]);
                        await AsyncStorage.setItem('user', json);
                        if (data[0].initialized === true) {
                            router.replace({pathname: '/swipe'});
                        } else {
                            router.replace({pathname: '/setup'});
                        }
                    } else if (error) {
                        // console.error(error);
                        return;
                    }
                })()
            } else {
                router.replace("/login");
            }
        })
    },[navigationState?.key])
    
    // defines trigger for timed location gathering task: LOCATION_TASK_NAME
    const LOCATION_TASK_NAME = 'background-location-task'
    const startLocation = async () => {
        // console.log('Tracking Started');
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 30000, // 30 second intervals
            distanceInterval: 0,
        })
    }
    
    // defines function for timed location gathering task: LOCATION_TASK_NAME
    // location is returned on an interval and stored in an array,
    // when the most recent location exceeds a certain distance from the mean and enough time has passed at the location,
    // grab detailed location and business data and store the users location,
    // check the db for users at the same location at the same time and with suitable preferences,
    // store the potential match in the database
    TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
        if (error) {
            // console.log('LOCATION_TRACKING task ERROR: ', error);
            return;
        } else if (data) {
            const { locations } = data;

            // grab stored location data
            const response = await AsyncStorage.getItem('savedLocations');

            // if no data stored then create the object and return
            if (response === null) {
                const json = JSON.stringify({
                    id: null,
                    startTime: locations[0].timestamp,
                    count: 1,
                    averages: {
                        lat: locations[0].coords.latitude,
                        lon: locations[0].coords.longitude
                    }
                })
                await AsyncStorage.setItem('savedLocations', json);
                return;
            }

            // generate lat and lon averages and use them to calculate the current distance from mean, also calculate the duration at location
            const savedLocations = JSON.parse(response);

            const avgLatitude = savedLocations.averages.lat;
            const avgLongitude = savedLocations.averages.lon;
            
            const METERS_PER_KILOMETER = 1000;
            const distance = getDistanceFromLatLonInKm(locations[0].coords.latitude, locations[0].coords.longitude, avgLatitude, avgLongitude) * METERS_PER_KILOMETER;
            const duration = locations[0].timestamp - savedLocations.startTime;
            // check if the distance exceeds 30 meters
            const MAXIMUM_DISTANCE_METERS = 30;
            if (distance > MAXIMUM_DISTANCE_METERS) {
                // check if the duration exceeds 10 minutes
                const MINIMUM_DURATION_MINUTES = 10;
                const MINIMUM_DURATION_MILLISECONDS = MINIMUM_DURATION_MINUTES * 60 * 1000;
                if (duration > MINIMUM_DURATION_MILLISECONDS) {
                    (async () => {
                        // grabs the users info from storage
                        const response = await AsyncStorage.getItem('user');
                        const user = JSON.parse(response);

                        // grabs detailed location information from google maps api
                        const latlng = avgLatitude + ', ' + avgLongitude;

                        const locationResponse = await fetch("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + latlng + "&key=" + process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY);
                        const locationData = await locationResponse.json();

                        const location = {
                            streetNumber: locationData.results[0].address_components[0].long_name,
                            street: locationData.results[0].address_components[1].long_name,
                            city: locationData.results[0].address_components[3].long_name,
                            province: locationData.results[0].address_components[6].long_name,
                            country: locationData.results[0].address_components[7].long_name,
                            postalCode: locationData.results[0].address_components[8].long_name,
                            placeID: locationData.results[0].place_id,
                            lat: locationData.results[0].geometry.location.lat,
                            lon: locationData.results[0].geometry.location.lng,
                        }

                        if (locationData) {
                            // check businesses db for existing businesses
                            const businessesResponse = await supabase.from('businesses').select().eq('place_id', location.placeID);
                            if (businessesResponse.data[0]) {
                                var businessID = businessesResponse.data[0].id;
                                var timezone = businessesResponse.data[0].timezone;
                            } else if (businessesResponse.error) {
                                // console.error(businessesResponse.error)
                            } else { 
                                // if no business found then uses the google places api for business information and inserts into businesses db                            
                                const response = await fetch("https://maps.googleapis.com/maps/api/place/details/json?place_id=" + location.placeID + "&fields=name,utc_offset&key=" + process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY);
                                const place = await response.json();
                                
                                const MINUTES_PER_HOUR = 60;
                                const { data, error } = await supabase.from('businesses').insert({
                                    country: location.country,
                                    province: location.province,
                                    city: location.city,
                                    postal_code: location.postalCode,
                                    street: location.street,
                                    street_number: location.streetNumber,
                                    place_id: location.placeID,
                                    name: place.result.name,
                                    lat: location.lat,
                                    lon: location.lon,
                                    timezone: place.result.utc_offset / MINUTES_PER_HOUR
                                })
                                .select()
                                if (data) {
                                    var businessID = data[0].id;
                                    var timezone = data[0].timezone;
                                }
                            }

                            // simplified location information object
                            const simplified = {
                                id: savedLocations.id,
                                user: user.id,
                                arrivalTime: savedLocations.startTime,
                                departureTime: savedLocations.startTime + duration,
                                business: businessID
                            }
                          
                            // grab the users current potential matches and matches
                            let matches = [];

                            const matchesResponse = await supabase.from('matches').select().or(`user_one.eq.${user.id},user_two.eq.${user.id}`);
                            if (matchesResponse.data[0]) {
                                matches.push(...matchesResponse.data);
                            } else if (matchesResponse.error) {
                                // console.error(matchesResponse.error);
                            }

                            const potmatchesResponse = await supabase.from('potmatches').select().or(`user_one.eq.${user.id},user_two.eq.${user.id}`);
                            if (potmatchesResponse.data[0]) {
                                matches.push(...potmatchesResponse.data);
                            } else if (potmatchesResponse.error) {
                                // console.error(potmatchesResponse.error);
                            }

                            matches = matches.map(item => {
                                if (item.user_one === user.id) {
                                    return item.user_two;
                                } else {
                                    return item.user_one;
                                }
                            })

                            // grabbing all others from db that were at the same location while the user was there
                            const { data, e } = await supabase.from('locations').select().eq('business', simplified.business).gt('departureTime', simplified.arrivalTime);
                            if (data) {
                                data.map(async (item) => {
                                    // calculates the time overlap of user and other at the location
                                    let time;
                                    if (item.arrivalTime > simplified.arrivalTime) {
                                        time = item.departureTime - item.arrivalTime;
                                    } else {
                                        time = item.departureTime - simplified.arrivalTime;
                                    }

                                    // check that time overlap was greater than 5 minutes
                                    const MINIMUM_TIME_MINUTES = 5;
                                    const MINIMUM_TIME_MILLISECONDS = MINIMUM_TIME_MINUTES * 60 * 1000;
                                    if (time > MINIMUM_TIME_MILLISECONDS) {
                                        // grab the others preferences
                                        const { data, error } = await supabase.from('profiles').select().eq('id', item.user);
                                        if (data) {
                                            // confirm that preferences match and that the match does not already exist
                                            if  ((data[0].gender === user.preference) && (data[0].preference === user.gender) && !(matches.includes(data[0].id))) {
                                                // store the potmatch in db
                                                const rowID = uuid.v4();
                                                const { e } = await supabase.from('potmatches').insert({
                                                    id: rowID,
                                                    user_one: user.id,
                                                    user_two: item.user,
                                                    business: simplified.business,
                                                    meeting_time: (item.arrivalTime > simplified.arrivalTime) ? item.arrivalTime : simplified.arrivalTime,
                                                    duration: time,
                                                    timezone: timezone
                                                })
                                                if (e) {
                                                    // console.error(e);
                                                }
                                            }
                                        } else if (error) {
                                            // console.error(error);
                                        }
                                    }
                                })
                            } else if (e) {
                                // console.error(e);
                            }

                            // final update to the location
                            const { error } = await supabase.from('locations').update({
                                lat: ((avgLatitude + locations[0].coords.latitude) / 2).toFixed(7),
                                lon: ((avgLongitude + locations[0].coords.longitude) / 2).toFixed(7),
                                business: simplified.business,
                                departureTime: simplified.departureTime
                            }).eq('id', savedLocations.id)
                            if (error) {
                                // console.error(error);
                            }
                        }
                    })()
                }
                
                // final update with departure time to db
                const { error } = await supabase.from('locations').update({
                    lat: ((avgLatitude + locations[0].coords.latitude) / 2).toFixed(7),
                    lon: ((avgLongitude + locations[0].coords.longitude) / 2).toFixed(7),
                    departureTime: savedLocations.startTime + duration
                }).eq('id', savedLocations.id)
                if (error) {
                    // console.error(error);
                }

                // reset the stored location array on device and return
                const json = JSON.stringify({
                    id: null,
                    startTime: locations[0].timestamp,
                    count: 1,
                    averages: {
                        lat: locations[0].coords.latitude,
                        lon: locations[0].coords.longitude
                    }
                })
                await AsyncStorage.setItem('savedLocations', json);
                return;

            } else if (((savedLocations.count + 1) % 5) === 0) { // updates the db locations entry every 5 updates to devices location, if no entry then it creates one
                // creates new locations entry
                if (savedLocations.id === null) {
                    // grabs the user info from storage
                    const response = await AsyncStorage.getItem('user');
                    const user = JSON.parse(response);

                    const rowID = uuid.v4();
                    const simplified = {
                        id: rowID,
                        user: user.id,
                        arrivalTime: savedLocations.startTime,
                        lat: avgLatitude.toFixed(7),
                        lon: avgLongitude.toFixed(7),
                        departureTime: null,
                        business: null
                    }

                    // updates location info on device with db id
                    const json = JSON.stringify({
                        ...savedLocations,
                        id: rowID
                    })
                    await AsyncStorage.setItem('savedLocations', json);

                    // inserts location to db
                    const { error } = await supabase.from('locations').insert(simplified);
                    if (error) {
                        // console.error(error);
                    }
                } else {
                    // updates the location info in db
                    const { error } = await supabase.from('locations').update({
                        lat: ((avgLatitude + locations[0].coords.latitude) / 2).toFixed(7),
                        lon: ((avgLongitude + locations[0].coords.longitude) / 2).toFixed(7)
                    }).eq('id', savedLocations.id)
                    if (error) {
                        // console.error(error);
                    }
                }
            }

            // console.log(`dvc: ${Device.deviceName}, mnLat: ${avgLatitude.toFixed(8)}, mnLong: ${avgLongitude.toFixed(8)}, dur: ${(duration / 1000).toFixed(2)}, dist: ${distance.toFixed(2)}`)
            
            // updates the location info on device storage if no action was taken prior 
            const responseWithID = await AsyncStorage.getItem('savedLocations');
            const savedLocationsWithID = JSON.parse(responseWithID);
            const json = JSON.stringify({
                ...savedLocationsWithID,
                count: savedLocationsWithID.count + 1,
                averages: {
                    lat: (avgLatitude + locations[0].coords.latitude) / 2,
                    lon: (avgLongitude + locations[0].coords.longitude) / 2
                }
            })
            await AsyncStorage.setItem('savedLocations', json);
        }
    })
    
    // asks the user for foreground and background location permissions and begins location gathering task if granted
    useEffect(() => {
        (async () => {
            const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
            const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

            if (foregroundStatus != 'granted' && backgroundStatus !== 'granted') {
                // console.log('Permission to access location was denied');
            } else {
                // console.log('Permission to access location granted');
                startLocation();
            }
        })()
    },[])

    return (
        <SafeAreaView style={globalStyles.androidSafe}>
            {!navigationState?.key && <Text>LOADING...</Text>}
        </SafeAreaView>
    )
}

export default Index;