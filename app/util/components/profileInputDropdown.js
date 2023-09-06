import { globalStyles, globalSizes, globalColors } from '../../../globalDesign';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Entypo } from '@expo/vector-icons';
import { useState } from 'react';

// gender dropdown selector
const ProfileInputDropdown = ({ title, value, setValue, items, onChange }) => {
    // selector state
    const [isFocus, setIsFocus] = useState(false);

    // sets the dropdowns value on change and fires the provided callback function
    const handleChange = (item) => {
        setValue(item.value);
        setIsFocus(false);
        if(typeof onChange === 'function'){
            onChange(item.value);
         }    
    }

    return (
        <View style={styles.card}>
            <Text style={{...globalStyles.fontSmallBold, color: globalColors.darkPrimary}}>{title}: </Text>
            <View style={{flex: 1, marginLeft: 4}}>
                {/* dropdown menu */}
                <Dropdown 
                    style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    data={items}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocus ? 'Select item' : '...'}
                    value={value}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={item => {handleChange(item)}}
                    renderRightIcon={() => (
                        <Entypo 
                            name="pencil" 
                            color={globalColors.secondary}
                            size={globalSizes.medium}
                        />
                    )}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        position: 'relative',
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 10,
        width: '100%',
        borderRadius: 10,
        alignItems: 'center',
        ...globalStyles.boxShadows,
        backgroundColor: 'white',
    },
    dropdown: {
        height: 22,
        width: '100%',
    },
    placeholderStyle: {
        ...globalStyles.fontSmall,
        color: globalColors.darkNeutral
    },
    selectedTextStyle: {
        ...globalStyles.fontSmall,
        color: globalColors.darkNeutral
    }
})

export default ProfileInputDropdown;