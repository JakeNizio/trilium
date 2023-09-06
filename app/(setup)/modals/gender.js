import { globalStyles, globalSizes, globalColors, globalDimensions } from '../../../globalDesign';
import { Modal, Pressable, SafeAreaView, Text, View, StyleSheet } from 'react-native';
import LogoMain from '../../../components/logoMain';
import { Ionicons } from '@expo/vector-icons';
import { errorToast } from '../../../utilities'
import { useState } from 'react';
import ProfileInputDropdown from './components/profileInputDropdown'


const Gender = ({ isVisible, onBackward, onForward, gender, setGender, preference, setPreference }) => {
    // validation state
    const [hasValidGender, setHasValidGender] = useState(true);
    const [hasValidPreference, setHasValidPreference] = useState(true);

    // dropdown values
    const genderItems = [
        {label: 'Male', value: 'male'},
        {label: 'Female', value: 'female'},
        // {label: 'Male + Female', value: 'bi'},
        {label: 'Other', value: 'other'}
    ]
    const preferenceItems = [
        {label: 'Male', value: 'male'},
        {label: 'Female', value: 'female'},
        {label: 'Male + Female', value: 'bi'},
        {label: 'Other', value: 'other'}
    ]

    // handles next page
    const onNext = () => {
        // resets validation state
        setHasValidGender(true);
        setHasValidPreference(true);
        let validated = true;

        // validates selections
        if (!gender) {
            setHasValidGender(false);
            validated = false;
        }

        if (!preference) {
            setHasValidPreference(false);
            validated = false;
        }

        // routes to next page
        if (validated) {
            onForward();
        } else {
            errorToast('Enter all information');
        }     
    }

    return (
        <Modal animationType='slide' visible={isVisible} transparent={true}>
            <SafeAreaView style={globalStyles.androidSafe}>
                {/* logo header */}
                <View style={globalStyles.logoHeader}>
                    <LogoMain/>
                    <View style={styles.headerLeft}>
                        <Ionicons name="chevron-back" size={globalSizes.xl} color={globalColors.darkPrimary} onPress={onBackward}/>
                    </View>
                </View>
                <View style={styles.container}>
                    <View style={styles.mainContent}>
                        <Text style={styles.titleFont}>Account Setup</Text>

                        {/* gender input */}
                        <View style={styles.inputField}>
                            <Text style={styles.inputNameFont}>Gender:</Text>
                            <ProfileInputDropdown title={'Gender'} value={gender} setValue={setGender} items={genderItems}/>
                        </View>

                        {/* preference input */}
                        <View style={styles.inputField}>
                            <Text style={styles.inputNameFont}>Preference:</Text>
                            <ProfileInputDropdown title={'Preference'} value={preference} setValue={setPreference} items={preferenceItems}/>
                        </View>

                        {/* next page button */}
                        <Pressable style={{...styles.nextButton, backgroundColor: (gender && preference) ? globalColors.primary : globalColors.neutral}} onPress={onNext}>
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
    },
    headerLeft: {
        position: 'absolute',
        left: 0,
        top:0,
        bottom: 0,
        justifyContent: 'center',
    }
})

export default Gender;