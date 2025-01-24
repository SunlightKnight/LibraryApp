import { StyleSheet, Dimensions, Animated, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

import colors from './colors';
import padding from './padding';
import fontSize from './fontSize';

// Variable used to determine header height, that changes between platforms and device models.
export const HEADER_HEIGHT = (Platform.OS === "ios" && DeviceInfo.hasDynamicIsland()) ? 100 : 
                              (Platform.OS === "ios" && DeviceInfo.hasNotch()) ? 90 : Platform.OS === "android" ? 90 : 70;

// Animation used for stack navigation. For more info, check:
// https://reactnative.dev/docs/animated
export const slideAnimation = ({
  current,
  next,
  inverted,
  layouts: {screen},
}: any) => {
  const progress = Animated.add(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
    next ? next.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }) : 0,
  );
                              
  return {
    cardStyle: {
      opacity: progress.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [0, 1, 0],
      }),
      transform: [
        {
          translateX: Animated.multiply(
            progress.interpolate({
              inputRange: [0, 1, 2],
              outputRange: [
                screen.width, // Focused, but offscreen in the beginning
                0, // Fully focused
                screen.width * -0.3, // Fully unfocused
              ],
              extrapolate: 'clamp',
            }),
            inverted,
          ),
        },
      ],
    },
  };
};
                              
// Object used to contain "general style", used on multiple screens. Here you can define styles
// that wuold be redundant to write out in every screen.
const commonStyles = StyleSheet.create({
  backgroundImage: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollingContainer: {
    width: '100%',
    height: '100%',
  },
  scrollingContent: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: padding.half,
    paddingHorizontal: padding.full,
  },
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: "transparent",
  },
  textInputText: {
    flex: 1,
    marginHorizontal: padding.full,
    color: colors.black,
    fontSize: fontSize.normal
  },
  roundedTopCorners: {
    borderTopLeftRadius: Dimensions.get('window').width / 9,
    borderTopRightRadius: Dimensions.get('window').width / 3,
    overflow: 'hidden',
  },
  roundedBottomsCorners: {
    borderBottomLeftRadius: Dimensions.get('window').width / 12,
    borderBottomRightRadius: Dimensions.get('window').width / 4,
    overflow: 'hidden',
  },
  shadow: {
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5
  },
  titleContainer: {
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginHorizontal: padding.half, 
    marginVertical: padding.half
  },
  roundedViewContainer: {
    flex: 1, 
    backgroundColor: colors.white, 
    marginTop: padding.full, 
    paddingBottom: padding.full, 
    borderRadius: 5
  }
});

export default commonStyles;