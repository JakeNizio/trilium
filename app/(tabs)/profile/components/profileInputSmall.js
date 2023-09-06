import { globalStyles, globalSizes, globalColors } from '../../../../globalDesign';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { useRef } from 'react';

// small single-line text input for profile
const ProfileInputSmall = ({ title, text, setText, onSubmit }) => {

    const textInputRef = useRef();

    return (
        <View style={styles.card}>
            <Text style={{...globalStyles.fontSmallBold, color: globalColors.darkPrimary}}>{title}:  </Text>
            <TextInput
                onChangeText={newText => setText(newText)}
                onEndEditing={onSubmit}
                value={text}
                ref={textInputRef}
                maxLength={(title === 'Emoji') ? 2 : 40}
                style={{...globalStyles.fontSmall, color: globalColors.darkNeutral}}
            />
            <View style={styles.positionRight}>
                {/* pressing calls focus on input ref opening it for editing */}
                <Entypo onPress={()=>{textInputRef.current.focus()}} name="pencil" color={globalColors.secondary} size={globalSizes.medium}/>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        position: 'relative',
        flexDirection: 'row',
        padding: 16,
        width: '100%',
        borderRadius: 10,
        alignItems: 'center',
        ...globalStyles.boxShadows,
        backgroundColor: 'white',
        overflow: 'hidden',
        paddingRight: 130
    },
    positionRight: {
        position: 'absolute',
        right: 10,
        top:0,
        bottom: 0,
        justifyContent: 'center'
    }
})

export default ProfileInputSmall;