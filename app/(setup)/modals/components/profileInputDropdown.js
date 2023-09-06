import { globalStyles, globalSizes, globalColors } from '../../../../globalDesign';
import { View, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Entypo } from '@expo/vector-icons';
import { useState } from 'react';

// gender dropdown selector
const ProfileInputDropdown = ({ title, value, setValue, items }) => {
    // selector state
    const [isFocus, setIsFocus] = useState(false);

    const handleChange = (item) => {
        setValue(item.value);
        setIsFocus(false);
    }

    return (
        <View style={styles.card}>
            <View style={{flex: 1, marginLeft: 4}}>
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