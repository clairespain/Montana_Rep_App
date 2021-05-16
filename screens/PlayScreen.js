import 'react-native-gesture-handler';
import React, { useState, useRef, useEffect } from 'react';
import {
    Animated,
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Dimensions,
    StatusBar,
    ScrollView,
    Image,
    ImageBackground,
    PermissionsAndroid,
    Pressable,
} from 'react-native';
import Video from 'react-native-video';
import Navigation from '../components/navigation/navigation';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Geolocation from 'react-native-geolocation-service';
import * as geolib from 'geolib';


import { db } from '../components/Firebase/firebase';

const { width, height } = Dimensions.get('screen');
const ITEM_WIDTH = width;
const ITEM_HEIGHT = height * .88;

export default ({ navigation: { goBack }, navigation, route }) => {

    const [distance, setDistance] = useState('');
    const [play, setPlay] = useState(null);


    useEffect(() => {
        Geolocation.getCurrentPosition(
            (position) => {
                checkPosition(position.coords);
            },
            (error) => {
                console.log(error.code, error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }, [play]);


    useEffect(() => {
        db.collection("content").doc(route.params.id).onSnapshot((snapshot) => {
            setPlay(snapshot._data);
        })
    }, []);


    function checkPosition(currentPosition) {
        if (play !== null && play.geopoints[0].latitude !== '' || play !== null && play.geopoints.length > 1) {
            let pointId = 0
            //CHECK for null
            if (route.params.pointId !== null) {
                pointId = route.params.pointId;

            } else { //If null, choose closest
                var arr = [];

                for (var i = 0; i < play.geopoints.length; i++) {
                    arr.push(geolib.getDistance(currentPosition, play.geopoints[i]));

                    // for (var j = 1; j < arr.length; j++) {
                    //     if (arr[j] < arr[0]) {
                    //         pointId = j - 1;
                    //     }
                    // }                    
                }
                pointId = arr.indexOf(Math.min(...arr));
                //console.log(pointId)
            }

            const distance = (geolib.getDistance(currentPosition, play.geopoints[pointId]));

            if (distance < 10) {
                setLocked(false);
                const feet = Math.floor((geolib.convertDistance(distance, "ft")));
                if (feet == 1) {
                    setDistance(
                        feet + ' foot away'
                    );
                } else {
                    setDistance(
                        feet + ' feet away'
                    );
                }
            } else if (distance < 90) {
                const feet = Math.floor((geolib.convertDistance(distance, "ft")))
                if (feet == 1) {
                    setDistance(
                        feet + ' foot away'
                    );
                } else {
                    setDistance(
                        feet + ' feet away'
                    );
                }
            } else {
                const miles = Math.round((geolib.convertDistance(distance, "mi") + Number.EPSILON) * 100) / 100;
                if (miles == 1) {
                    setDistance(
                        miles + 'mile away'
                    );
                } else {
                    setDistance(
                        miles + ' miles away'
                    );
                }
            }
        }
    }


    const video = useRef(null);
    const [locked, setLocked] = useState(true);
    const [premium, setPremium] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [seekTime, setSeekTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [fullScreen, setFullScreen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [paused, setPaused] = useState(true);
    const [progress, setProgress] = useState(new Animated.Value(currentTime));


    const onProgress = (data) => {
        if (!loading) {
            setCurrentTime(data.currentTime);
        }
    };

    const onLoad = (data) => {
        setDuration(data.duration);
        setLoading(false);
    };

    const onEnd = () => {
        video.current.seek(0);
        setPaused(true);
        console.log("Ended");
        let views = play.views + 1;

        db.collection("content").doc(route.params.id).update({
            views: views,
        })
    };

    const handleProgressPressIn = (e) => {
        const position = e.nativeEvent.locationX;
        var barPosition;

        if (position < 0) {
            barPosition = 0;
        } else if (position > (ITEM_WIDTH * 0.83)) {
            barPosition = ITEM_WIDTH * 0.83;
        } else {
            barPosition = position;
        }

        const newProgress = (barPosition / (ITEM_WIDTH * 0.83)) * duration;
        Animated.timing(progress, {
            useNativeDriver: false,
            toValue: newProgress,
            duration: 500
        }).start();
    }

    const handleProgressPressOut = (e) => {
        const position = e.nativeEvent.locationX;
        var barPosition;

        if (position < 0) {
            barPosition = 0;
        } else if (position > (ITEM_WIDTH * 0.83)) {
            barPosition = ITEM_WIDTH * 0.83;
        } else {
            barPosition = position;
        }

        const newProgress = (barPosition / (ITEM_WIDTH * 0.83)) * duration;
        Animated.timing(progress, {
            useNativeDriver: false,
            toValue: newProgress,
            duration: 500
        }).start();

        video.current.seek(newProgress);
    }


    useEffect(() => {
        Animated.timing(progress, {
            useNativeDriver: false,
            toValue: currentTime,
            duration: 500
        }).start();
    }, [currentTime])


    return <View>


        {/* MAIN CONTENT */}
        {(function () {

            if (play !== null) {
                return <ScrollView>

                    <StatusBar translucent={true} hidden={true} />

                    {/* AUDIO/VIDEO HEADER */}
                    <View style={styles.header} >
                        <ImageBackground source={{ uri: play.mainPhotoUrl }} style={styles.image}>
                            <View style={styles.overlay}>

                                {/* video */}
                                <Video source={{ uri: play.playUrl }}
                                    ref={video}
                                    rate={1.0}
                                    volume={1.0}
                                    paused={paused}
                                    muted={false}
                                    resizeMode={"contain"}
                                    style={styles.video}
                                    onProgress={onProgress}
                                    onLoad={onLoad}
                                    onEnd={onEnd}
                                    ignoreSilentSwitch={"ignore"}
                                    playInBackground={true}
                                    playWhenInactive={true}
                                />

                                {/* title */}
                                <Text style={styles.title}>{play.title}</Text>

                                {/* controls */}
                                {
                                    locked ? //<TouchableOpacity onPress={() => { setLocked(false), alert('Unlocked') }}>
                                        <FontAwesome5
                                            name="lock"
                                            solid
                                            color="#fff"
                                            size={40}
                                            style={{ padding: 10, }}
                                        />
                                        //</TouchableOpacity> 
                                        : <TouchableOpacity onPress={() => { paused ? setPaused(false) : setPaused(true) }}>
                                            <FontAwesome5
                                                name={paused ? "play" : "pause"}
                                                solid
                                                color="#fff"
                                                size={40}
                                                style={{ padding: 10, }}
                                            />
                                        </TouchableOpacity>
                                }


                                <TouchableWithoutFeedback
                                    hitSlop={{ top: 20, right: 10, bottom: 20, left: 10 }}
                                    onPressIn={!locked ? (e) => handleProgressPressIn(e) : null}
                                    onPressOut={!locked ? (e) => handleProgressPressOut(e) : null}
                                    touchSoundDisabled={true}
                                >

                                    <View style={styles.progressBar} >
                                        <Animated.View style={[styles.progressBarFill, {
                                            width: progress.interpolate({
                                                inputRange: [0, duration],
                                                outputRange: ['3%', '100%'],
                                            })
                                        }
                                        ]}
                                        >
                                            {/* <Animated.View style={styles.progressDot}></Animated.View> */}
                                        </Animated.View>
                                    </View>
                                </TouchableWithoutFeedback>

                            </View>
                        </ImageBackground>
                    </View>

                    {/* discription */}
                    <View style={styles.discription}>
                        <View style={{ paddingHorizontal: 10, width: '100%' }}>
                            <Text style={[styles.postLabel, { padding: 10, color: '#999', textAlign: "center" }]}>{distance}</Text>
                            {(function () {
                                if (play.locationInfo !== '' && play.locationInfo !== ' ' && play.locationInfo !== null) {
                                    return <View style={{ padding: 20, backgroundColor: "white", borderWidth: 1, borderColor: '#999', borderRadius: 5, marginBottom: 20, }}>
                                        <Text allowFontScaling style={styles.text_location}>{play.locationInfo}</Text>
                                    </View>
                                }
                            })()}
                        </View>

                        <Text style={styles.text_title}>{play.title}</Text>

                        {(function () {
                            if (play.subHeader !== '' && play.subHeader !== ' ' && play.subHeader !== null) {
                                return <Text allowFontScaling style={styles.text_subtitle}>{play.subHeader}</Text>
                            }
                        })()}

                        <View style={{ paddingVertical: 20, }}>
                            {(function () {
                                if (play.screenwriter !== '' && play.screenwriter !== ' ' && play.screenwriter !== null) {
                                    return <Text allowFontScaling style={styles.subtext}>{play.screenwriter}</Text>
                                }
                            })()}

                            {(function () {
                                if (play.actorInfo !== '' && play.actorInfo !== ' ' && play.actorInfo !== null) {
                                    return <Text allowFontScaling style={styles.subtext}>{play.actorInfo}</Text>
                                }
                            })()}
                        </View>

                        {(function () {
                            if (play.body !== '' && play.body !== ' ' && play.body !== null) {
                                return <Text allowFontScaling style={styles.subtext}>{play.body}</Text>
                            }
                        })()}

                        {!locked ? <Text allowFontScaling style={styles.subtext}></Text> : null}
                        {
                            !premium ? <TouchableOpacity
                            //onPress={() => [setLocked(false), alert('Unlocked')]}
                            >
                                <View style={[styles.subButton]}>

                                    <Text style={styles.subButtonText}>Unlock</Text>

                                </View>
                            </TouchableOpacity> : null
                        }
                        {(function () {
                            if (play.addInfo !== '' && play.addInfo !== ' ' && play.addInfo !== null) {
                                return <Text allowFontScaling style={styles.subtext}>{play.addInfo}</Text>
                            }
                        })()}

                        {(function () {
                            if (play.copyrightDate !== '' && play.copyrightDate !== ' ' && play.copyrightDate !== null) {
                                return <Text allowFontScaling style={styles.subtext}>{play.copyrightDate}</Text>
                            }
                        })()}

                    </View>

                    {/* footer */}
                    <View style={styles.footer}>
                        <Image source={require('../assets/1_MontanaRep_PrimaryLogo_GreenLandscape.png')} style={styles.footer_logo} />

                    </View>



                </ScrollView>
            }

        })()}

        <TouchableOpacity style={styles.back} onPress={() => goBack()}>
            <FontAwesome5
                name="chevron-left"
                solid
                color="#fff"
                size={30}
                style={{ padding: 20, }}
            />
        </TouchableOpacity>

        <Navigation navigation={navigation} />
    </View>
}

const styles = StyleSheet.create({
    fill: {
        flex: 1,
    },
    header: {
        backgroundColor: '#fff',
        overflow: 'hidden',
        height: ITEM_HEIGHT,
    },
    video: {
        position: 'absolute',
        height: "100%",
        width: ITEM_WIDTH,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    discription: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        marginTop: 18,
        marginHorizontal: 45,
    },
    postLabel: {
        fontSize: 16,
        fontFamily: 'FuturaPT-Medium',
        lineHeight: 20,
        textTransform: 'uppercase'
    },
    image: {
        width: "100%",
        height: "100%",
    },
    footer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 30
    },
    footer_logo: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        marginBottom: 70,
        width: 212,
        height: 90,
    },

    text_title: {
        color: "black",
        fontSize: 28,
        fontFamily: 'FuturaPT-Medium',
        margin: 10,
    },

    text_subtitle: {
        fontSize: 20,
        fontFamily: 'FuturaPT-Book',
        paddingHorizontal: 40,
        paddingBottom: 10,
        lineHeight: 20,
    },

    text_location: {
        fontSize: 16,
        fontFamily: 'FuturaPT-Book',
        lineHeight: 20,
    },

    subtext: {
        fontSize: 18,
        fontFamily: 'FuturaPT-Book',
        paddingHorizontal: 30,
        paddingVertical: 5,
        lineHeight: 20,
    },

    back: {
        position: 'absolute',
        top: 0,
        alignSelf: "flex-start",
    },

    title: {
        color: '#fff',
        textTransform: 'uppercase',
        fontFamily: 'FuturaPT-Demi',
        fontSize: 50,
        letterSpacing: 5,
        margin: 10,
        textAlign: 'center',
    },

    button: {
        backgroundColor: '#cc8a05',
        width: 177,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        margin: 10,
        position: "relative",
        zIndex: 99,
    },
    buttonText: {
        fontFamily: 'FuturaPT-Book',
        fontSize: 24,
        color: "white",
    },

    subButton: {
        backgroundColor: '#004E47',
        width: ITEM_WIDTH * .75,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        borderRadius: 5,
        position: "relative",
        zIndex: 99,
    },
    subButtonText: {
        fontFamily: 'FuturaPT-Book',
        fontSize: 20,
        color: "white",
    },

    progressBar: {
        position: 'absolute',
        bottom: 40,
        backgroundColor: 'white',
        height: 9,
        borderRadius: 5,
        width: ITEM_WIDTH * 0.83,
    },
    progressBarFill: {
        backgroundColor: '#CC8A05',
        height: 9,
        borderRadius: 5,
        width: 0,
        flexDirection: "row-reverse",
        alignItems: "center",
    },
    progressDot: {
        backgroundColor: '#CC8A05',
        height: 14,
        borderRadius: 15,
        marginRight: -7,
        width: 14,
    },
    postLabel: {
        fontSize: 16,
        fontFamily: 'FuturaPT-Medium',
        lineHeight: 20,
        textTransform: 'uppercase'
    },


})