// Component imports
import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, DefaultTheme, NavigationState } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Loader from "../components/Loader";
import CustomHeader from '../components/CustomHeader';
import loadingAnimation from '../assets/animations/loading.json';
import no_connection from '../assets/animations/no_connection.json';

// Functions, variables, and type imports
import { useTranslation } from 'react-i18next';
import { icon_back, icon_search } from '../assets';
import { BackHandler } from 'react-native';

// Assets and styles imports
import colors from '../styles/colors';
import styles, { HEADER_HEIGHT, slideAnimation } from '../styles/styles';
import padding from '../styles/padding';
import commonStyles from '../styles/styles';

// Pages imports
import HomePage from './BookList/Homepage.tsx';
import BookList from './BookList/BookList';
import BookDetail from './BookList/BookDetail';
import BookCategory from './BookList/BookCategory.tsx';

// Create Stack Navigator
const Stack = createStackNavigator();

// Theme setup for the navigation
const Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.white,
  },
};

export default function AppFlowCoordinator() {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const navRef = useRef<any>();

  const screenOptions = {
    title: '',
    backgroundColor: colors.white,
    headerStyle: {
      backgroundColor: colors.primary,
      shadowColor: 'transparent',
      elevation: 0,
      height: 0,
    },
    headerTintColor: colors.white,
    headerBackTitleVisible: false,
    cardStyleInterpolator: slideAnimation,
    gestureEnabled: false,
    headerBackground: () => (
      <View style={commonStyles.headerBackground}>
        <View style={commonStyles.titleContainer}>
          <Image source={icon_search} style={commonStyles.iconStyle} />
        </View>
      </View>
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
          marginTop: Platform.OS === "ios" ? padding.full : HEADER_HEIGHT - 30,
        }}
      />
    ),
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log("*** AppFlowCoordinator - LOADED");
  };

  const handleLoader = (loading: boolean) => {
    setLoading(loading);
    if (loading) {
      BackHandler.addEventListener('hardwareBackPress', handleAndroidBackButtonPress);
    } else {
      BackHandler.removeEventListener('hardwareBackPress', handleAndroidBackButtonPress);
    }
  };

  const handleAndroidBackButtonPress = () => {
    return true;
  };

  const handleSearch = (bookSearchQuery : string) => {
    setBookSearchQuery(bookSearchQuery);
    navRef.current?.navigate("BookList", { parentProps : {handleLoader,loading,bookSearchQuery}});
  }

  const navigateToBookDetail = (book: any) => {
    navRef.current?.navigate("BookDetail", { book });
  };

  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [connectionError, setError] = useState<boolean | null>(null);
  const [currentCategory,setCurrentCategory] = useState<string>()

  const handleErrorLoader = (isVisible: boolean) => {
    setError(isVisible);
  }

  const pages: { [key: string]: any } = {
    Homepage: {
      component: HomePage,
      parentProps: {
        handleLoader,
        setBookSearchQuery,
        handleErrorLoader: (isVisible: boolean) => setError(isVisible),
        setCurrentCategory,
        connectionError,
        loading
      },
      header: {
        title: 'Homepage',
        customHeader: () => (
          <CustomHeader onSearch={(bookSearchQuery) => handleSearch(bookSearchQuery)} />
        ),
        headerBackImage: () => null,
      },
    },
    BookList: {
      component: BookList,
      parentProps: {
        handleLoader,
        loading,
        bookSearchQuery,
      },
      nav: {
        "BookDetail": navigateToBookDetail,
        "BookCategory": (category: string, books: any[]) =>
          navRef.current?.navigate("BookCategory", { category, books }),
      },
      header: {
        title: 'BookList',
        customHeader: () => (
          <CustomHeader onSearch={(query) => handleSearch(query)} />
        ),
        headerBackImage: () => (
          <></>
        ),
      },
    },
    BookItemSuggestion: {
      nav: {
        "BookDetail": navigateToBookDetail,
      },
    },
    BookDetail: {
      component: BookDetail,
      parentProps: { handleLoader },
      header: {
        title: 'Book Detail',
        customHeader: () => (
          <View style={commonStyles.headerBackground} />
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
              marginTop: Platform.OS === "ios" ? padding.full : HEADER_HEIGHT - 50,
            }}
          />
        ),
      },
    },
    BookCategory: {
      component: BookCategory,
      parentProps: { handleLoader },
      header: {
        title: 'Book Category',
        customHeader: () => (
          <CustomHeader title={currentCategory}/>
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
              marginTop: Platform.OS === "ios" ? padding.full : HEADER_HEIGHT - 50,
            }}
          />
        ),
      },
    },
  };

  return (
    <View style={{ width: "100%", height: "100%" }}>
      <NavigationContainer
        ref={navRef}
        theme={Theme}
        onStateChange={(navigationState: NavigationState | undefined) => {
          console.log(`*** AppFlowCoordinator:onStateChange: navigationState=${JSON.stringify(navigationState)}`);
        }}>
        <Stack.Navigator initialRouteName="Homepage" screenOptions={screenOptions}>
          {Object.keys(pages).map((key: string) => {
            const page = pages[key];
            const PageComponent = page.component;
            return (
              <Stack.Screen
                key={key}
                name={key}
                options={{
                  title: page.header?.title || key,
                  headerBackground: page.header?.customHeader,
                  headerBackImage: page.header?.headerBackImage,
                }}>
                {(props) => (
                  <SafeAreaProvider style={{ paddingTop: HEADER_HEIGHT }}>
                    <PageComponent
                      {...props}
                      parentProps={page.parentProps}
                      nav={page.nav ? page.nav : undefined}
                    />
                  </SafeAreaProvider>
                )}
              </Stack.Screen>
            );
          })}
        </Stack.Navigator>
      </NavigationContainer>
      {!connectionError ? (<Loader loading={loading} animation={loadingAnimation} message='general.loading'/>) : (<Loader loading={connectionError} animation={no_connection} message='homepage.connection_error'/>)}
    </View>
  );
}
