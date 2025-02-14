import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Doc } from '../services/models/OpenLibraryResponse';
import { useTranslation } from 'react-i18next';

const principalStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
    flex: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    maxWidth: '80%',
  },
  text: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    maxWidth: '80%',
  },
});

type BookPrincipalDetailsProp = {
  item: Doc;
};

const BookPrincipalDetails = ({ item }: BookPrincipalDetailsProp) => {
  const { t } = useTranslation();
  return (
    <View style={principalStyles.container}>
      <Text style={principalStyles.title}>{item.title}</Text>
      <Text style={principalStyles.text}>{item.author_name?.toString() || t('book_description.author_unknown')}</Text>
    </View>
  );
};

export default BookPrincipalDetails;
