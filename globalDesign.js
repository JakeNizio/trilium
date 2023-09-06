import { Dimensions, StyleSheet } from 'react-native';

const globalColors = {
    primary: '#251a4f',
    lightPrimary: '#86809d',
    darkPrimary: '#0a012f',
    secondary: '#90b1d4',
    lightSecondary: '#d9e8f7',
    darkSecondary: '#60768d',
    neutral: '#7d7d7d',
    lightNeutral: '#d1d1d1',
    darkNeutral: '#242424',
    highlight: '#73daff',
    error: 'indianred'
}

const globalDimensions = {
    screenWidth: Dimensions.get('window').width,
    screenHeight: Dimensions.get('window').height,
    marginOne: 15,
    marginTwo: 30,
    marginThree: 45,
    imageAspectRatio: (4/3)
}

const globalSizes = {
    mini: 14,
    small: 16,
    medium: 20,
    large: 28,
    xl: 42
}

const globalStyles = StyleSheet.create({
    androidSafe: {
        // paddingTop: Platform.OS === 'android' ? 25 : 0,
        paddingTop: Platform.OS === 'android' ? 10 : 0,
        flex: 1,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        margin: globalDimensions.marginOne,
        marginTop:8,
        // backgroundColor: '#FFB84D51',
    },
    logoHeader: {
        position: 'relative',
        alignItems: 'center',
        marginHorizontal: globalDimensions.marginOne,
        // backgroundColor: '#9EFFED51',
    },
    fontMini: {
        fontSize: globalSizes.mini
    },
    fontMiniBold: {
        fontWeight: 'bold',
        fontSize: globalSizes.mini
    },
    fontSmall: {
        fontSize: globalSizes.small
    },
    fontSmallBold: {
        fontWeight: 'bold',
        fontSize: globalSizes.small
    },
    fontMedium: {
        fontSize: globalSizes.medium
    },
    fontMediumBold: {
        fontWeight: 'bold',
        fontSize: globalSizes.medium
    },
    fontLarge: {
        fontSize: globalSizes.large
    },
    fontLargeBold: {
        fontWeight: 'bold',
        fontSize: globalSizes.large
    },
    fontXL: {
        fontSize: globalSizes.xl
    },
    fontXLBold: {
        fontWeight: 'bold',
        fontSize: globalSizes.xl
    },
    iconMini: {
        fontSize: globalSizes.mini
    },
    iconSmall: {
        fontSize: globalSizes.small
    },
    iconMedium: {
        fontSize: globalSizes.medium
    },
    iconLarge: {
        fontSize: globalSizes.large
    },
    iconXL: {
        fontSize: globalSizes.xl
    },
    iconMiniCircle: {
        justifyContent: 'center', 
        alignItems: 'center', 
        width: globalSizes.mini * 1.81, 
        height: globalSizes.mini * 1.81, 
        borderRadius: globalSizes.mini * 1.81 / 2, 
        backgroundColor: 'white'
    },
    iconSmallCircle: {
        justifyContent: 'center', 
        alignItems: 'center', 
        width: globalSizes.small * 1.81, 
        height: globalSizes.small * 1.81, 
        borderRadius: globalSizes.small * 1.81 / 2, 
        backgroundColor: 'white'
    },
    iconMediumCircle: {
        justifyContent: 'center', 
        alignItems: 'center', 
        width: globalSizes.medium * 1.81, 
        height: globalSizes.medium * 1.81, 
        borderRadius: globalSizes.medium * 1.81 / 2, 
        backgroundColor: 'white'
    },
    iconLargeCircle: {
        justifyContent: 'center', 
        alignItems: 'center', 
        width: globalSizes.large * 1.81, 
        height: globalSizes.large * 1.81, 
        borderRadius: globalSizes.large * 1.81 / 2, 
        backgroundColor: 'white'
    },
    iconXLCircle: {
        justifyContent: 'center', 
        alignItems: 'center', 
        width: globalSizes.xl * 1.81, 
        height: globalSizes.xl * 1.81, 
        borderRadius: globalSizes.xl * 1.81 / 2, 
        backgroundColor: 'white'
    },
    imageCardSmall: {
        width:(globalDimensions.screenWidth-(globalDimensions.marginOne*2))/3,
        height:((globalDimensions.screenWidth-(globalDimensions.marginOne*2))*(globalDimensions.imageAspectRatio))/3,
        resizeMode: 'cover',
        borderRadius: 16,
    },
    // imageCardLarge: {
    //     width:(globalDimensions.screenWidth-(globalDimensions.marginOne*2)),
    //     height:((globalDimensions.screenWidth-(globalDimensions.marginOne*2))*(globalDimensions.imageAspectRatio)),
    //     resizeMode: 'cover',
    //     borderRadius: 16
    // },
    imageCardLarge: {
        width: (globalDimensions.screenHeight * 0.45),
        maxWidth: (globalDimensions.screenWidth-(globalDimensions.marginOne*2)),
        height: (globalDimensions.screenHeight * 0.45)*(globalDimensions.imageAspectRatio),
        maxHeight: (globalDimensions.screenWidth-(globalDimensions.marginOne*2))*(globalDimensions.imageAspectRatio),
        resizeMode: 'cover',
        borderRadius: 16
    },
    boxShadows: {
        backgroundColor: 'lightgrey',
        shadowColor: 'black',
        shadowOpacity: 0.12,
        shadowRadius: 1.8,
        elevation: 3,
        shadowOffset: {
            width: 2.1,
            height: 3
        },
        
    }
})

module.exports = { globalColors, globalDimensions, globalSizes, globalStyles }