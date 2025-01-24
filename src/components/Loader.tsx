import React from 'react';
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native';

import colors from '../styles/colors';
import padding from '../styles/padding';

type LoaderProps = {
  loading: boolean
}

export default function Loader(props: LoaderProps) {
  return props.loading ? (
    <View style={styles.container}>
      <View style={styles.modal}>
        <View style={styles.activityIndicator}>
          <ActivityIndicator
            animating={props.loading}
            size="large"
            color={colors.primary}
            style={{
              marginTop: Platform.OS === "ios" ? padding.quarter : undefined,
              marginLeft: Platform.OS === "ios" ? padding.sixth : undefined
            }}
          />
        </View>
      </View>
    </View>
  ) : null;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    margin: 'auto',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modal: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: colors.blackOpacity25,
  },
  activityIndicator: {
    backgroundColor: colors.white,
    height: 60,
    width: 60,
    borderRadius: 30,
    display: 'flex',
    justifyContent: "center",
    alignItems: "center"
  },
});
