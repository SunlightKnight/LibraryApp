import React from 'react';
import { StyleSheet, View, Platform, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import colors from '../styles/colors';
import { AnimationObject } from 'lottie-react-native';
import { useTranslation } from 'react-i18next';

type LoaderProps = {
  loading: boolean;
  animation: string | AnimationObject | { uri: string; };
  message: string;
};

export default function Loader(props: LoaderProps) {
  const { t } = useTranslation()
  if (!props.loading) return null;

  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <View style={styles.loaderContent}>
          {/* Animazione Lottie */}
          <LottieView
            source={props.animation} // Percorso dell'animazione JSON
            autoPlay
            loop
            style = {{height : 100,width : 100}}
          />
          {/* Messaggio di caricamento */}
          <Text style={styles.loadingText}>{t(props.message)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bookContainerBackground,
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'Roboto',
  },
});