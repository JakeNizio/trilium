import { globalStyles, globalColors } from '../../../globalDesign';
import { ScrollView, View, Image, StyleSheet } from 'react-native';
import LoadingIndicator from '../../../components/loadingIndicator';
import { errorToast } from '../../../utilities'
import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseConnect';

// horizontal sliding image gallery
const ImageSlider = ({ images }) => {
    // index state
    const [sliderIndex, setSliderIndex] = useState(0);

    // image state
    const [otherImages, setOtherImages] = useState(null);

    // grabs images from db storage and sets image state
    useEffect(() => {
        (async () => {
            const expirationSeconds = 30;
            const { data, error } = await supabase.storage.from('avatars').createSignedUrls(images, expirationSeconds);
            if (data) {
                const imgs = [];
                data.map(item => {
                        imgs.push(item.signedUrl);
                })
                setOtherImages(imgs);
            } else if (error) {
                // errorToast(error.message);
            }
        })()
    },[]) 

    return (
        <View style={styles.imageCard}>
            {/* if no image state then shows loading */}
            {!otherImages ? <LoadingIndicator/> : <>
            {/* else shows image slider */}
            <ScrollView horizontal={true} pagingEnabled={true} showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(event) => {setSliderIndex(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width)}}>
                {otherImages.map(image => (
                    <Image key={image} source={{uri: image}} style={globalStyles.imageCardLarge}/>
                ))}
            </ScrollView>
            {/* index dot shows user position in gallery */}
            <View style={styles.sliderDotsContainer}>
                {images.map((item, index) => (
                        <View key={item} style={{...styles.sliderDots, backgroundColor: (index) === sliderIndex ? globalColors.secondary : 'rgba(255, 255, 255, 0.50)',}}></View>
                    ))}
            </View>
            </>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    imageCard: {
        overflow: 'hidden',
        ...globalStyles.imageCardLarge,
        ...globalStyles.boxShadows
    },
    sliderDotsContainer: {
        flex: 1,
        flexDirection: 'row',
        columnGap: 6,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    sliderDots: {
        width: 12,
        height: 12,
        borderRadius: 6
    }
})

export default ImageSlider;