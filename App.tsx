/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  StatusBar,
  View,
} from 'react-native';

import './src/localization/i18n';

import styles from './src/styles/styles';
import BackendServiceProvider from './src/services/BackedServiceProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppFlowCoordinator from './src/scenes/AppFlowCoordinator';


function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      {/* Backend service context, that allows all children to use his functions (Manages APIs). */}
      <BackendServiceProvider> 
        <View style={styles.container}>
          <StatusBar
            translucent
            barStyle={"dark-content"}
            backgroundColor={'transparent'}
          />
          <AppFlowCoordinator />
        </View>
      </BackendServiceProvider>
    </GestureHandlerRootView>
  );
}

export default App;
