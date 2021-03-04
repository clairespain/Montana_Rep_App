import 'react-native-gesture-handler';
import React, { useState, useRef } from 'react';
import {
  Text,
  View,
  Button,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  TextInput,
  StatusBar,
  ScrollView,
  FlatList,
  Image,
  SafeAreaView,
  ImageBackground,
  Animated,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Navigation from '../components/navigation/navigation';
import Cog from '../components/Cog';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('screen');

const ITEM_WIDTH = width;
const ITEM_HEIGHT = height * .90;

const PLAY_DATA = [
  {
    id: "1",
    title: "Mountain View",
    source: 'https://res.cloudinary.com/claire-dev/image/upload/v1612076013/mountain_nonpge.jpg',
    time: "Sep 25, 2025 15:00:00"
  },
  {
    id: "2",
    title: "Babble Brook",
    source: 'https://res.cloudinary.com/claire-dev/image/upload/v1612076013/glacier_aqjz96.jpg',
    time: "Sep 25, 2021 15:00:00"
  },
  {
    id: "3",
    title: "Fly Fish",
    source: 'https://res.cloudinary.com/claire-dev/image/upload/v1612076013/creek_dadkt3.jpg',
    time: ""
  },
  {
    id: "4",
    title: "Mountain View",
    source: 'https://res.cloudinary.com/claire-dev/image/upload/v1612076013/mountain_nonpge.jpg',
    time: "Sep 25, 2025 15:00:00"
  },
  {
    id: "5",
    title: "Babble Brook",
    source: 'https://res.cloudinary.com/claire-dev/image/upload/v1612076013/glacier_aqjz96.jpg',
    time: ""
  },
  {
    id: "6",
    title: "Fly Fish",
    source: 'https://res.cloudinary.com/claire-dev/image/upload/v1612076013/creek_dadkt3.jpg',
    time: "Sep 25, 2018 15:00:00"
  },
]

const Item = ({ item, onPress }) => (
  <ImageBackground source={{ uri: item.source }} style={styles.play}>
    <TouchableOpacity style={styles.play} onPress={onPress}>
      <View style={styles.overlay}>

        <Text style={styles.title}>{item.title}</Text>
      </View>
    </TouchableOpacity>
    <View style={styles.time}>
      <Text style={styles.timeText}>Coming Soon</Text>
    </View>
  </ImageBackground>
);

export default ({ navigation }) => {
  const [filter, setFilter] = useState("all");

  const [greenAnimation, setGreenAnimation] = useState('fadeOut');
  const [goldAnimation, setGoldAnimation] = useState('fadeOut');
  const [redAnimation, setRedAnimation] = useState('fadeOut');
  const [greenSize, setGreenSize] = useState(1.5);
  const [goldSize, setGoldSize] = useState(1.5);
  const [redSize, setRedSize] = useState(1.5);

  const scroll = useRef(null);

  function filterPosts(type) {
    //scroll.current.scrollToOffset({ offset: ITEM_HEIGHT, animated: true })
    if (filter !== type) {
      if (type == "mtrep") {
        setFilter("mtrep");
        selectGreen();
        setGreenSize(0);
        setGoldSize(1.5);
        setRedSize(1.5);
      } else if (type == "goplay") {
        setFilter("goplay");
        selectGold();
        setGreenSize(1.5);
        setGoldSize(0);
        setRedSize(1.5);
      } else if (type == "comm") {
        setFilter("comm");
        selectRed();
        setGreenSize(1.5);
        setGoldSize(1.5);
        setRedSize(0);
      }
    } else {
      setFilter("all");
      setGreenSize(1.5);
      setGoldSize(1.5);
      setRedSize(1.5);
    }

  }

  function selectGreen() {
    setGreenAnimation("fadeIn");
    setTimeout(function () { setGreenAnimation("fadeOutLeft"); }, 2000);
  }

  function selectGold() {
    setGoldAnimation("fadeIn");
    setTimeout(function () { setGoldAnimation("fadeOutLeft"); }, 2000);
  }

  function selectRed() {
    setRedAnimation("fadeIn");
    setTimeout(function () { setRedAnimation("fadeOutLeft"); }, 2000);
  }

  const [selectedId, setSelectedId] = useState(null);

  const renderItem = ({ item }) => {

    return (
      <Item
        item={item}
        //onPress={() => setSelectedId(item.id)  }
        onPress={() => navigation.navigate('Play')}
      />
    );
  };
  const safeAreaInsets = useSafeAreaInsets()
  return <View style={{
    flex: 1,
    //paddingTop: safeAreaInsets.top,
    paddingBottom: safeAreaInsets.bottom,
    paddingLeft: safeAreaInsets.left,
    paddingRight: safeAreaInsets.right,
  }}>
    <Cog onPress={() => navigation.navigate('Settings')} />
    <FlatList
      data={PLAY_DATA}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      extraData={selectedId}
    />
    <View style={{ height: 55 }}></View>

    <View style={{ position: "absolute", left: ITEM_WIDTH - 63, flexDirection: 'column', alignItems: 'flex-end', padding: 10, paddingTop: 55 }}>
      <Animatable.View animation={greenAnimation} duration={500} style={[{ backgroundColor: '#747A21', position: "absolute", left: -107, top: 65, width: 117, paddingLeft: 5, paddingRight: 5, borderRadius: 5 }]}><Text style={[styles.postLabel, { color: "white" }]}>Montana Rep</Text></Animatable.View>
      <TouchableOpacity onPress={() => filterPosts('mtrep')}><Animated.View style={[styles.postNavi, { backgroundColor: '#747A21', borderColor: "#0000", borderWidth: greenSize }]}></Animated.View></TouchableOpacity>
      <Animatable.View animation={goldAnimation} duration={500} style={[{ backgroundColor: '#cc8a05', position: "absolute", left: -65, top: 109, width: 75, paddingLeft: 5, paddingRight: 5, borderRadius: 5 }]}><Text style={[styles.postLabel, { color: "white" }]}>Go Play!</Text></Animatable.View>
      <TouchableOpacity onPress={() => filterPosts('goplay')}><Animated.View style={[styles.postNavi, { backgroundColor: '#cc8a05', borderColor: "#0000", borderWidth: goldSize }]}></Animated.View></TouchableOpacity>
      <Animatable.View animation={redAnimation} duration={500} style={[{ backgroundColor: '#A5580C', position: "absolute", left: -92, top: 152, width: 102, paddingLeft: 5, paddingRight: 5, borderRadius: 5 }]}><Text style={[styles.postLabel, { color: "white" }]}>Community</Text></Animatable.View>
      <TouchableOpacity onPress={() => filterPosts('comm')}><Animated.View style={[styles.postNavi, { backgroundColor: '#A5580C', borderColor: "#0000", borderWidth: redSize }]}></Animated.View></TouchableOpacity>
    </View>

    <Navigation navigation={navigation} />
  </View>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',

  },
  play: {
    flex: 1,
    width: ITEM_WIDTH,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',

  },
  title: {
    color: '#fff',
    textTransform: 'uppercase',
    fontFamily: 'FuturaPTDemi',
    fontSize: 30,
    letterSpacing: 5,
  },
  time: {
    backgroundColor: '#cc8a05',
    width: 177,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    position: "absolute",
    top: 0,
  },
  timeText: {
    fontFamily: 'FuturaPTBook',
    fontSize: 24,
    color: "white",
    //fontWeight: 'bold',

  },
  buttonText: {
    fontFamily: 'FuturaPTBook',
    fontSize: 24,
    color: "white",
    //fontWeight: 'bold',

  },
  postNavi: {
    minWidth: 13,
    minHeight: 13,
    borderRadius: 10,
    margin: 15,
  },
  postLabel: {
    fontSize: 16,
    fontFamily: 'FuturaPTMedium',
    lineHeight: 20,
    textTransform: 'uppercase'
  },

})