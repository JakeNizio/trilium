import { globalStyles, globalDimensions, globalSizes, globalColors } from '../../../../globalDesign';
import { View, ScrollView, Image, Pressable, StyleSheet, Text, Alert } from 'react-native';
import { AutoDragSortableView } from 'react-native-drag-sort';
import { Entypo } from '@expo/vector-icons';
import { errorToast } from '../../../../utilities'
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import uuid from 'react-native-uuid';
import { useEffect, useState } from 'react';
import { supabase } from '../../../../supabaseConnect';

// sortable horizontal image gallery that can be resorted and emended
const ImageModule = ({ userID, images, setImages, dragging, setDragging }) => {
    // image module state
    const [isSortable, setIsSortable] = useState(false);
    const [dataWasEdited, setDataWasEdited] = useState(false);
    
    // gets library permissions from user
    const [hasLibraryPermission, setHasLibraryPermission] = useState(null);
    useEffect(() => {
        (async () => {
            const libraryPermission = await MediaLibrary.requestPermissionsAsync();
            setHasLibraryPermission(libraryPermission.status === 'granted');
        })()
    },[])

    // updates profile images in db
    const updateDatabase = async () => {
        // grab just the image path
        const imgs = images.map(img => img[0]) ?? [];
        
        // create user images object
        let imageOne = null;
        let imageTwo = null;
        let imageThree = null;
        let imageFour = null;

        if (imgs.length > 0) imageOne = imgs[0];
        if (imgs.length > 1) imageTwo = imgs[1];
        if (imgs.length > 2) imageThree = imgs[2];
        if (imgs.length > 3) imageFour = imgs[3];

        const user ={
            imageOne: imageOne,
            imageTwo: imageTwo,
            imageThree: imageThree,
            imageFour: imageFour
        }
        
        // send user images object to db
        const { error } = await supabase.from('profiles').update(user).eq('id', userID);
        if (error) {
            errorToast(error.message);
        }
    }

    // when isSortable changes checks if data was edited and then updates db
    useEffect(() => {
        if (dataWasEdited) {
            updateDatabase(images);
        }
    },[isSortable])

    // adds image from library to db storage, db profile, and then stores the image in state
    const addContent = async () => {
            // if (!hasLibraryPermission) {
            //     Alert.alert('Please enable library permissions...');
            //     return;
            // }

            if (images?.length > 3) {
                Alert.alert('Maximum number of photos reached');
                return;
            }

            // opens library
            const result = await ImagePicker.launchImageLibraryAsync({
                quality: 1,
            })

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

                // sends image to db storage
                const pictureID = uuid.v4();
                const { data, error } = await supabase.storage.from('avatars').upload(pictureID, {uri: resizedResult.uri}, {contentType: 'image/jpg'});
                if (data) {
                    let column = '';
                    if (images?.length === 3) {
                        column = 'imageFour';
                    } else if (images?.length === 2) {
                        column = 'imageThree';
                    } else if (images?.length === 1) {
                        column = 'imageTwo';
                    } else if (images?.length === 0) {
                        column = 'imageOne';
                    } else if (images === undefined) {
                        column = 'imageOne';
                    }

                    // sends storage path to db profile
                    await supabase.from('profiles').update({[column]: data.path}).eq('id', userID);

                    // updates image state with new image
                    setImages([...(images ? images : []), [data.path, resizedResult.uri]]);
                } else if (error) {
                    errorToast(error.message);
                }
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
                // removes image from storage and then updates image state
                onPress: async () => {
                    const { data, error} = await supabase.storage.from('avatars').remove([images[index][0]]);
                    if (data) {
                        const newArray = images.slice(0,index).concat(images.slice(index+1));
                        setImages(newArray);
                        setDataWasEdited(true);
                    } else if (error) {
                        errorToast(error.message);
                    }
                }
            },
         
        ])
    }

    // when data is changed update state and toggle data was edited
    const onDataChange = (data) => {
        setImages(data);
        setDataWasEdited(true);
    }

    return (
        <View style={styles.imageModuleFrame}>
            {/* if images show horizontal slider */}
            {images?.length > 0 ?
            <>
                {/* horizontal scroll for images, if the user is dragging, scroll is disabled */}
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} scrollEnabled={dragging ? false : true} contentContainerStyle={{justifyContent: 'center'}} style={{paddingBottom: 6, marginRight: 15}}>
                    <View style={{height: globalStyles.imageCardSmall.height + 6}}>
                    {/* drag to sort images enabled when isSortable active */}
                    <AutoDragSortableView
                        dataSource={images}
                        parentHeight={globalStyles.imageCardSmall.height}
                        parentWidth={images.length * (globalStyles.imageCardSmall.width + 10)}
                        childrenWidth={globalStyles.imageCardSmall.width}
                        childrenHeight={globalStyles.imageCardSmall.height}
                        marginChildrenRight={10}
                        sortable={isSortable}
                        onDragStart={()=>setDragging(true)}
                        onDragEnd={()=>setDragging(false)}
                        isDragFreely={true}
                        delayLongPress={0.01}
                        onDataChange={data => onDataChange(data)}
                        // keyExtractor={(item, index) => item}
                        renderItem={(item, index) => {
                            return (
                                // show image cards
                                <View key={item[0]} style={styles.imageCard}>
                                    <View style={{...globalStyles.imageCardSmall, overflow:'hidden'}}>
                                        <Image source={{uri: item[1]}} style={isSortable ? styles.imageCardEdit : {...globalStyles.imageCardSmall}}/>
                                    </View>
                                    {/* if isSortable then show remove icon and order numbers */}
                                    {isSortable && 
                                        <>
                                            {/* press removes image */}
                                            <Pressable onPress={()=>{removeImage(index)}} style={{...globalStyles.iconMediumCircle, position: 'absolute', right: 0, opacity: 0.7, backgroundColor: ''}}>
                                                <Entypo name="trash" color={'white'} size={globalSizes.medium}/>
                                            </Pressable>
                                            <View style={{...globalStyles.iconMediumCircle, position: 'absolute', bottom: 10, left: 10, opacity: 0.7}}>
                                                <Text style={{...globalStyles.fontMediumBold, color: globalColors.darkNeutral}}>{index + 1}</Text>
                                            </View>
                                        </>
                                    }
                                </View>
                            )
                        }}
                    />
                    </View>
                    {/* if isSortable include an add image card */}
                    {isSortable && 
                        // press adds image
                        <Pressable onPress={() => addContent()} style={{...styles.imageCard, justifyContent: 'center', alignItems: 'center'}}>
                            <Entypo name="plus" color={'white'} size={globalSizes.xl}/>
                        </Pressable>
                    }
                </ScrollView>

                {/* sortable toggle on press */}
                {isSortable ?
                <View style={{rowGap: 20}}>
                    <Pressable onPress={()=>{setIsSortable(!isSortable)}} style={styles.circleButton}>
                        <Entypo name="check" color={'limegreen'} size={globalSizes.medium}/>
                    </Pressable>
                </View>
                :
                <Pressable onPress={()=>{setIsSortable(!isSortable)}} style={styles.circleButton}>
                    <Entypo name="pencil" color={globalColors.secondary} size={globalSizes.medium}/>
                </Pressable>
                }
            </>
            // if no images then display an add button
            :
            <Pressable onPress={()=>addContent()} style={{...styles.imageCard, justifyContent: 'center', alignItems: 'center'}}>
                <Entypo name="circle-with-plus" color={globalColors.neutral} size={globalSizes.large}/>
            </Pressable>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    imageModuleFrame: {
        height: ((globalDimensions.screenWidth-(globalDimensions.marginOne*2))*(globalDimensions.imageAspectRatio))/3 + 6,
        marginTop: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible'
    },
    imageCard: {
        // overflow: 'hidden',
        ...globalStyles.boxShadows,
        ...globalStyles.imageCardSmall,
    },
    circleButton: {
        ...globalStyles.boxShadows,
        ...globalStyles.iconMediumCircle,
    },
    imageCardEdit: {
        ...globalStyles.imageCardSmall,
        opacity: 0.6
    }
})

export default ImageModule;