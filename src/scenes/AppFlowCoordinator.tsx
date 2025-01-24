import { useContext, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Image,
  Platform,
  View,
} from 'react-native';

// import { BackendServiceContext } from '../services/BackedServiceProvider';
import Loader from "../components/Loader"
import styles, { HEADER_HEIGHT, slideAnimation } from '../styles/styles';
import { createStackNavigator } from '@react-navigation/stack';
import { DefaultTheme, NavigationContainer, NavigationState } from '@react-navigation/native';
import colors from '../styles/colors';
// import { useTranslation } from 'react-i18next';
import padding from '../styles/padding';
import { icon_back } from '../assets';
import BookList from './BookList/BookList';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createStackNavigator()
const Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.white
  },
};

export default function AppFlowCoordinator() {
  // State variable that manages the Loader's operation.
  const [loading, setLoading] = useState(false)
  // const backendService = useContext(BackendServiceContext)
  // const { t } = useTranslation()
  const navRef = useRef<any>()

  const screenOptions = {
    title: '',
    backgroundColor: colors.white,
    headerStyle: {
      backgroundColor: colors.primary,
      shadowColor: 'transparent',
      elevation: 0, // https://github.com/react-navigation/react-navigation/issues/865
      height: 0,
    },
    headerTintColor: colors.white,
    headerBackTitleVisible: false,
    cardStyleInterpolator: slideAnimation,
    gestureEnabled: false,
    headerBackground: () => (
      <View
        style={{
          width: '100%',
          height: HEADER_HEIGHT,
          backgroundColor: colors.primary
        }}
      />
    ),
    headerBackImage: () => (
      <Image
        source={icon_back}
        resizeMode="contain"
        style={{
          width: 30, 
          height: 30, 
          tintColor: colors.white, 
          marginHorizontal: padding.half,
          marginTop: Platform.OS === "ios" ? padding.full : HEADER_HEIGHT-30
        }} />
    ),
    // headerRight: () => {},
  };

  // useEffect hook: no dependencies between the [] are defined, hence it's called only once.
  // For more info: https://react.dev/reference/react/useEffect
  useEffect(() => {
    loadData()
  }, [])

  // Retrieves user's username and saved token.
  const loadData = async () => {
    console.log("*** AppFlowCoordinator - LOADED")
  }

  // Handles Loader by using "setLoader" function (see line 19).
  const handleLoader = (loading: boolean) => {
    setLoading(loading)
    if (loading) {
      BackHandler.addEventListener('hardwareBackPress', handleAndroidBackButtonPress);
    } else {
      BackHandler.removeEventListener('hardwareBackPress', handleAndroidBackButtonPress);
    }
  }

  // Disables Android back button while Loader is active.
  const handleAndroidBackButtonPress = () => {
    return true
  }

  const navigateToBookDetail = () => {

  }

  const pages: {[key: string]: any} = {
    BookList: {
      component: BookList,
      parentProps: { handleLoader },
      nav: { 
        "bookDetail": navigateToBookDetail, 
      }
    },
  };

  return (
    <View style={{width: "100%", height: "100%"}}>
      <NavigationContainer
        ref={navRef}
        theme={Theme}
        onStateChange={(navigationState: NavigationState | undefined) => {
          console.log(`*** AppFlowCoordinator:onStateChange: navigationState=${JSON.stringify(navigationState)}`)
        }}>
        
        <Stack.Navigator
          initialRouteName={'BookList'}
          screenOptions={screenOptions}>
            {Object.keys(pages).map((key: string) => {
              const page = pages[key];
              const PageComponent = page.component;
              return (
                <Stack.Screen
                  key={key}
                  name={key}>
                  {(props) => {
                    return (
                      <SafeAreaProvider style={{paddingTop: HEADER_HEIGHT}}>
                        <PageComponent
                          {...props}
                          parentProps={page.parentProps}
                          nav={page.nav ? page.nav : undefined}
                        />
                      </SafeAreaProvider>
                    );
                  }}
                </Stack.Screen>
              );
          })}
        </Stack.Navigator>
      </NavigationContainer>
      <Loader loading={loading} />
    </View>
  )
}
