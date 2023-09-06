import { globalStyles, globalColors, globalDimensions } from '../../../globalDesign';
import { Modal, Pressable, SafeAreaView, Text, View, StyleSheet } from 'react-native';
import LogoMain from '../../../components/logoMain';
import { errorToast } from '../../../utilities'
import ProfileAgeDropdown from './components/profileAgeDropdown'
import { useState } from 'react';
import { getAgeFromBirthday } from '../../../utilities'

const Birthday = ({ isVisible, onBackward, onForward, birthday, setBirthday }) => {
    const minimumAge = 18;
    
    // validation state
    const [hasValidBirthday, setHasValidBirthday] = useState(true);

    // validates users age
    const validateBirthday = (value) => {
        const age = getAgeFromBirthday(value);
        if (age >= minimumAge) return true;
        return false;
    }

    // handles next page
    const onNext = () => {
        // resets validation state
        setHasValidBirthday(true);

        // routes to next page
        if (validateBirthday(birthday)) {
            onForward();
        } else {
            setHasValidBirthday(false);
            errorToast('User under 18');
        }     
    }

    return (
        <Modal animationType='slide' visible={isVisible} transparent={true}>
            <SafeAreaView style={globalStyles.androidSafe}>
                {/* logo header */}
                <View style={globalStyles.logoHeader}>
                    <LogoMain/>
                </View>
                <View style={styles.container}>
                    <View style={styles.mainContent}>
                        <Text style={styles.titleFont}>Account Setup</Text>
            
                        {/* birthday input */}
                        <View style={styles.inputField}>
                            <Text style={styles.inputNameFont}>Birthday:</Text>
                            <ProfileAgeDropdown title={'Birthday'} value={birthday} setValue={setBirthday} hasValidBirthday={hasValidBirthday}/>
                        </View>

                        {/* next page button */}
                        <Pressable style={{...styles.nextButton, backgroundColor: birthday ? globalColors.primary : globalColors.neutral}} onPress={onNext}>
                            <Text style={{...globalStyles.fontMedium, color: 'white'}}>Next</Text>
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
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
    nextButton: {
        ...globalStyles.boxShadows,
        alignItems: 'center',
        marginTop: 12,
        width: '100%',
        padding: 14,
        borderRadius: 12,
        backgroundColor: globalColors.primary,
    }
})

export default Birthday;