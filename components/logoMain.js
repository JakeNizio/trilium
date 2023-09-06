import { Image } from "react-native";

const LogoMain = () => {
    return (
            <Image 
                style={{
                    height: 80,
                    width: 80,
                    marginLeft: 19,
                    shadowColor: 'black',
                    // shadowOpacity: 0.1, // error message might ignorable
                    shadowRadius: 2,
                    shadowOffset: {
                        width: 2,
                        height: 3
                    },
                }}
                source={require('../assets/TrilliumLogo.png')}
            />
    )
}


export default LogoMain;