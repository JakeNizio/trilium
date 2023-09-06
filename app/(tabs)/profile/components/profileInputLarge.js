import { globalStyles, globalSizes, globalColors } from '../../../../globalDesign';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { useRef } from 'react';

// large wrapped text input for profile
const ProfileInputLarge = ({ title, text, setText, onSubmit }) => {
    
    const textInputRef = useRef();

    return (
        <View style={styles.card}>
            <Text style={{...globalStyles.fontSmallBold, color: globalColors.darkPrimary}}>{title}:  </Text>
            <TextInput
                multiline={true}
                blurOnSubmit={true}
                onChangeText={newText => setText(newText)}
                onEndEditing={onSubmit}
                ref={textInputRef}
                maxLength={150}
                style={{...globalStyles.fontSmall, color: globalColors.darkNeutral}}
            >
                {text}
            </TextInput>
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
        padding: 16,
        width: '100%',
        borderRadius: 10,
        rowGap: 2,
        ...globalStyles.boxShadows,
        backgroundColor: 'white',
    },
    positionRight: {
        position: 'absolute',
        right: 10,
        top:16,
        bottom: 0,
    }
})

export default ProfileInputLarge;