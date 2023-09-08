import { globalStyles, globalSizes, globalColors, globalDimensions } from '../../../globalDesign';
import { Image as Img, Modal, Alert, Pressable, SafeAreaView, Text, View, StyleSheet } from 'react-native';
import { AutoDragSortableView } from 'react-native-drag-sort';
import LogoMain from '../../../components/logoMain';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

// add images screen for setup page
const Image = ({ isVisible, onBackward, onForward, image, setImage }) => {
    
    // library permissions state
    const [hasLibraryPermission, setHasLibraryPermission] = useState(null);

    // gets library permissions from user
    useEffect(() => {
        (async () => {
            const libraryPermission = await MediaLibrary.requestPermissionsAsync();
            setHasLibraryPermission(libraryPermission.status === 'granted');
        })()
    },[])

    // handles next page
    const onNext = () => {
        onForward();
    }

    // grabs and resizes image from library and adds to state
    const addImage = async () => {
        // if (!hasLibraryPermission) {
        //     Alert.alert('Please enable library permissions...');
        //     return;
        // }

        if (image?.length > 3) {
            Alert.alert('Maximum number of photos reached');
            return;
        }

        // opens library
        const result = await ImagePicker.launchImageLibraryAsync({
            quality: 1,
        });

        // resizes image to a standard size
        if (!result.canceled) {
            const resizedResult = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [{
                    resize: {
                        height: 800
                    }
                }],
                { compress: 0.3}
            )
            setImage(prev => prev ? [...prev, resizedResult.uri] : [resizedResult.uri]);
        }
    }

    // removes image from db storage
    const removeImage = (index) => {
        Alert.alert('Are you sure you want delete this image?','',[
            {
                text: 'Cancel'
            },
            {
                text: 'Yes',
                onPress: () => {
                    const newArray = image?.slice(0,index).concat(image.slice(index+1));
                    if (newArray.length > 0) {
                        setImage(newArray);
                    } else {
                        setImage();
                    }
                }
            },
            
        ])
    }

    return (
        <Modal animationType='slide' visible={isVisible} transparent={true}>
            <SafeAreaView style={globalStyles.androidSafe}>
                {/* logo header */}
                <View style={globalStyles.logoHeader}>
                    <LogoMain/>
                    <View style={styles.headerLeft}>
                        <Ionicons name="chevron-back" size={globalSizes.xl} color={globalColors.darkPrimary} onPress={()=>onBackward()}/>
                    </View>
                </View>
                <View style={styles.container}>
                    <View style={styles.mainContent}>
                        <Text style={styles.titleFont}>Account Setup</Text>

                        <View style={styles.inputField}>
                            <Text style={styles.inputNameFont}>Picture:</Text>

                            {/* sortable picture module */}
                            {image &&
                            <View style={{width: '100%', alignItems: 'center'}}>
                                {/* auto sizes view for two images per row */}
                                <View style={{height: (globalStyles.imageCardSmall.height + 10) * Math.ceil(image.length / 2), width: (globalStyles.imageCardSmall.width + 10) * 2}}>
                                    <AutoDragSortableView
                                        dataSource={image}
                                        parentWidth={globalDimensions.screenWidth - globalDimensions.marginTwo}
                                        childrenWidth={globalStyles.imageCardSmall.width}
                                        childrenHeight={globalStyles.imageCardSmall.height}
                                        marginChildrenRight={10}
                                        marginChildrenBottom={10}
                                        sortable={true}
                                        isDragFreely={true}
                                        delayLongPress={0.1}
                                        onDataChange={data => setImage(data)}
                                        renderItem={(item, index) => {
                                            return (
                                                // show image cards
                                                <View key={item} style={styles.imageCard}>
                                                    <View style={{...globalStyles.imageCardSmall, overflow:'hidden'}}>
                                                        <Img source={{uri: item}} style={globalStyles.imageCardSmall}/>
                                                    </View>
                                                    {/* remove image button */}
                                                    <Pressable onPress={()=>{removeImage(index)}} style={{...globalStyles.iconMediumCircle, position: 'absolute', right: 0, opacity: 0.7, backgroundColor: ''}}>
                                                        <Entypo name="trash" color={'white'} size={globalSizes.medium}/>
                                                    </Pressable>
                                                    {/* index number */}
                                                    <View style={{...globalStyles.iconMediumCircle, position: 'absolute', bottom: 10, left: 10, opacity: 0.7}}>
                                                        <Text style={{...globalStyles.fontMediumBold, color: globalColors.darkNeutral}}>{index + 1}</Text>
                                                    </View>
                                                </View>
                                            )
                                        }}
                                    />
                                </View>
                            </View>
                            }
                        </View>
                        
                        {/* add content button */}
                        <Pressable style={{...styles.nextButton, backgroundColor: (!image || image.length < 4) ? globalColors.primary : globalColors.neutral}} onPress={()=>addImage()}>
                            <Text style={{...globalStyles.fontMedium, color: 'white'}}>Add Image</Text>
                        </Pressable>

                        {/* next page button */}
                        <Pressable style={{...styles.nextButton, backgroundColor: image ? globalColors.primary : globalColors.neutral}} onPress={()=>onNext()}>
                            <Text style={{...globalStyles.fontMedium, color: 'white'}}>Finish</Text>
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
    },
    imageCard: {
        // overflow: 'hidden',
        ...globalStyles.boxShadows,
        ...globalStyles.imageCardSmall,
    },
})

export default Image;