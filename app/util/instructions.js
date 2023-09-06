import { globalStyles, globalDimensions, globalSizes, globalColors } from '../../globalDesign';
import { Pressable, Modal, Text, View, SafeAreaView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react'

// App instructions modal
const Instructions = ({isVisible, onClose}) => {
    // page state
    const [page, setPage] = useState(1);

    // first page with content
    const One = () => {
        return(
            <View style={styles.cardContainer}>
                {/* image */}
                <View style={styles.imageContainer}>
                </View>
                {/* text */}
                <View style={styles.textContainer}>
                    <Text style={styles.headerFont}>Overview</Text>
                    <Text style={styles.bodyFont}>Body</Text>
                </View>
                {/* page control buttons */}
                <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <MaterialIcons onPress={()=>{setPage(2)}} name="arrow-forward" size={30} color={globalColors.secondary} />
                </View>
            </View>
        )
    }

    // second page with content
    const Two = () => {
        return(
            <View style={styles.cardContainer}>
                {/* image */}
                <View style={styles.imageContainer}>
                </View>
                {/* text */}
                <View style={styles.textContainer}>
                    <Text style={styles.headerFont}>Nearby</Text>
                    <Text style={styles.bodyFont}>Body</Text>
                </View>
                {/* page control buttons */}
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <MaterialIcons onPress={()=>{setPage(1)}} name="arrow-back" size={30} color={globalColors.secondary} />
                    <MaterialIcons onPress={()=>{setPage(3)}} name="arrow-forward" size={30} color={globalColors.secondary} />
                </View>
            </View>
        )
    }

    // third page with content
    const Three = () => {
        return(
            <View style={styles.cardContainer}>
                {/* image */}
                <View style={styles.imageContainer}>
                </View>
                {/* text */}
                <View style={styles.textContainer}>
                    <Text style={styles.headerFont}>Swipe Tab</Text>
                    <Text style={styles.bodyFont}>Body</Text>
                </View>
                {/* page control buttons */}
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <MaterialIcons onPress={()=>{setPage(2)}} name="arrow-back" size={30} color={globalColors.secondary} />
                    <MaterialIcons onPress={()=>{setPage(4)}} name="arrow-forward" size={30} color={globalColors.secondary} />
                </View>
            </View>
        )
    }

    // fourth page with content
    const Four = () => {
        return(
            <View style={styles.cardContainer}>
                {/* image */}
                <View style={styles.imageContainer}>
                </View>
                {/* text */}
                <View style={styles.textContainer}>
                    <Text style={styles.headerFont}>Chatting</Text>
                    <Text style={styles.bodyFont}>Body</Text>
                </View>
                {/* page control buttons */}
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <MaterialIcons onPress={()=>{setPage(3)}} name="arrow-back" size={30} color={globalColors.secondary} />
                    <MaterialIcons onPress={()=>{setPage(5)}} name="arrow-forward" size={30} color={globalColors.secondary} />
                </View>
            </View>
        )
    }

    // fifth page with content
    const Five = () => {
        return(
            <View style={styles.cardContainer}>
                {/* image */}
                <View style={styles.imageContainer}>
                </View>
                {/* text */}
                <View style={styles.textContainer}>
                    <Text style={styles.headerFont}>Finish Setting Up Profile</Text>
                    <Text style={styles.bodyFont}>Body</Text>
                </View>
                {/* page control buttons */}
                <View style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
                    <MaterialIcons onPress={()=>{setPage(4)}} name="arrow-back" size={30} color={globalColors.secondary} />
                </View>
            </View>
        )
    }

    return (
        <Modal animationType='slide' transparent={true} visible={isVisible}>
            <SafeAreaView style={{...globalStyles.androidSafe, backgroundColor: 'rgba(52, 52, 52, 0.8)'}}>
                <View style={{...globalStyles.container, rowGap: 30, justifyContent: 'center'}}>
                    {/* page controller */}
                    <View style={{...globalStyles.imageCardLarge, padding: 14 , backgroundColor: 'white'}}>
                        {(page === 1) && <One/>}
                        {(page === 2) && <Two/>}
                        {(page === 3) && <Three/>}
                        {(page === 4) && <Four/>}
                        {(page === 5) && <Five/>}
                        <Pressable onPress={onClose} style={{alignItems: 'center', justifyContent: 'center', height: 30, width: 30, borderRadius: 15, borderWidth: 1, borderColor: globalColors.darkNeutral, backgroundColor: 'white', position: 'absolute', right: -10, top: -10}}>
                            <MaterialIcons name="close" size={20} color={globalColors.darkNeutral}/>
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        justifyContent: 'space-between'
    },
    imageContainer:{
        // height: 280,
        height: '56%',
        width: '100%',
        backgroundColor: globalColors.secondary,
        borderRadius: 10
    },
    textContainer: {
        flex: 1,
        marginTop: 10
    },
    headerFont: {
        ...globalStyles.fontLargeBold,
        color: globalColors.primary
    },
    bodyFont: {
        ...globalStyles.fontMedium,
        color: globalColors.darkNeutral
    }
})

export default Instructions;