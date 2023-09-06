import { globalStyles, globalDimensions, globalSizes, globalColors } from '../../globalDesign';
import { Ionicons, Entypo, FontAwesome } from '@expo/vector-icons';
import { Modal, Text, View, SafeAreaView, StyleSheet, ImageBackground } from 'react-native';
import ImageSlider from './components/imageSlider';

// detailed profile modal - shows others images and public profile information
const OtherProfile = ({isVisible, onClose, user}) => {
    return (
        <Modal animationType='slide' visible={isVisible}>
            <ImageBackground imageStyle={{opacity: 0.3}} style={{height: globalDimensions.screenHeight}} source={require('../../assets/TrilliumBackground.png')}>
            <SafeAreaView style={{...globalStyles.androidSafe}}>
                <View style={{...globalStyles.container}}>
                    {/* header */}
                    <View style={styles.headerContainer}>
                        <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{...styles.imageText, marginTop: 0, left: 7, marginLeft:24}}>{user.full_name}, {user.age} {user.emoji}</Text>
                        <Ionicons style={{position: 'absolute', left: 0}} name="chevron-back" size={globalSizes.xl} color={globalColors.darkPrimary} onPress={onClose}/>
                    </View>
                    {/* image slider */}
                    <View style={styles.imageSliderContainer}>
                        <ImageSlider images={user.images}/>
                    </View>
                    {/* info card */}
                    <View style={{...styles.infoCard}}>
                        <View>
                            <View style={styles.iconText}>
                                <FontAwesome name="location-arrow" size={globalSizes.medium} color={globalColors.secondary} />
                                <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{...globalStyles.fontMediumBold, color: globalColors.darkPrimary, marginRight: 14}}>{user.location}</Text>
                            </View>
                            <Text style={{...globalSizes.small, color: globalColors.primary}}>@ {user.time}</Text>
                        </View>
                        <View style={styles.iconText}>
                            <Entypo name="suitcase" size={globalSizes.small} color={globalColors.secondary} />
                            <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{...globalStyles.fontSmallBold, color: globalColors.darkPrimary}}>{user.occupation}</Text>
                        </View>
                        <Text style={{...globalStyles.fontSmall, color: globalColors.darkNeutral}}>{user.bio}</Text>
                    </View>
                </View>
            </SafeAreaView>
            </ImageBackground>
        </Modal>
    )
}

const styles = StyleSheet.create({
    imageText: {
        color: 'white',
        textShadowColor: 'black',
        textShadowRadius: 2,
        textShadowOffset: {
            width: 1,
            height: 1,
        },
        ...globalStyles.fontLargeBold,
    },
    infoCard: {
        width: '100%',
        marginTop: 14,
        borderRadius: 10,
        padding: 14,
        rowGap: 6,
        ...globalStyles.boxShadows,
        backgroundColor: 'white',
        width: (globalDimensions.screenHeight * 0.45),
        maxWidth: (globalDimensions.screenWidth-(globalDimensions.marginOne*2)),
    },
    iconText: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 8
    },
    // imageSliderContainer: {
    //     height: ((globalDimensions.screenWidth-(globalDimensions.marginOne*2))*(globalDimensions.imageAspectRatio)),
    // },
    imageSliderContainer: {
        height: (globalDimensions.screenHeight * 0.45)*(globalDimensions.imageAspectRatio),
        maxHeight: (globalDimensions.screenWidth-(globalDimensions.marginOne*2))*(globalDimensions.imageAspectRatio),
    },
    headerContainer: {
        width: '100%',
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        // height: globalSizes.xl
    }
})

export default OtherProfile;