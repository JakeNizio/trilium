import { globalStyles, globalDimensions, globalSizes, globalColors } from '../../globalDesign';
import { Modal, Text, View, StyleSheet, SafeAreaView, ImageBackground } from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

// map modal with a location pin, also displays match time and business
const Map = ({isVisible, onClose, location, time, initialRegion}) => {    
    return (
        <Modal animationType='slide' visible={isVisible}>
            <ImageBackground imageStyle={{opacity: 0.3}} style={{height: globalDimensions.screenHeight}} source={require('../../assets/TrilliumBackground.png')}>
                <SafeAreaView style={{...globalStyles.androidSafe}}>
                    <View style={{...globalStyles.container, rowGap: 30}}>
                        {/* header */}
                        <View style={styles.headerContainer}>
                            <Text style={{...globalStyles.fontLarge, color: globalColors.primary}}>You met here 📌</Text>
                            <Ionicons style={{position: 'absolute', left: 0}} name="chevron-back" size={globalSizes.xl} color={globalColors.darkPrimary} onPress={onClose}/>
                        </View>
                        {/* map and marker */}
                        <View style={{rowGap: 14}}>
                            <View style={{...globalStyles.imageCardLarge, ...globalStyles.boxShadows}}>
                                <View style={{...globalStyles.imageCardLarge, overflow: 'hidden'}}>
                                    <MapView provider={'google'} initialRegion={initialRegion} style={globalStyles.imageCardLarge}>
                                        <Marker coordinate={initialRegion}/>
                                    </MapView> 
                                </View>
                            </View>
                            {/* business and time */}
                            <View style={styles.locationCard}>
                                <View style={styles.iconText}>
                                    <FontAwesome name="location-arrow" size={globalSizes.large} color={globalColors.secondary} />
                                    <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{...globalStyles.fontMediumBold, color: globalColors.darkPrimary, marginRight: 14}}>{location}</Text>
                                </View>
                                <Text style={{...globalStyles.fontMedium, color: globalColors.primary}}>@ {time}</Text>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </Modal>
    )
}

const styles = StyleSheet.create({
    headerContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: globalSizes.xl
    },
    locationCard: {
        // width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        ...globalStyles.boxShadows,
        backgroundColor: 'white',
        width: globalStyles.imageCardLarge.width,
        maxWidth: globalStyles.imageCardLarge.maxWidth
    },
    iconText: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 8
    },
})

export default Map;