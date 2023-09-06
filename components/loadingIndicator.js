import { ActivityIndicator, View } from "react-native";
import { globalSizes, globalStyles } from '../globalDesign';

const LoadingIndicator = () => {
    return (
        <View style={{...globalStyles.container, justifyContent: 'center'}}>
            <ActivityIndicator size={globalSizes.xl} color='#000A45AD'/>
        </View>
    )
}

export default LoadingIndicator;