import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Doc } from '../services/models/OpenLibraryResponse';
import * as AppConfig from '../config/config';
import { icon_noimage } from '../assets';
import colors from '../styles/colors';

interface BookItemSuggestionProps {
  book: Doc;
}

const BookItemSuggestion = ({ book }: BookItemSuggestionProps) => {
  const { t } = useTranslation();

  const getCoverUri = () => {
    if (book.cover_edition_key) {
      return `${AppConfig.COVER_ENDPOINT_EDITION_KEY}/${book.cover_edition_key}-M.jpg`;
    }
    if (book.cover_i) {
      return `${AppConfig.COVER_ENDPOINT_ID}/${book.cover_i}-M.jpg`;
    }
    if (book.isbn) {
      return `${AppConfig.COVER_ENDPOINT_ISBN}/${book.isbn}-M.jpg`;
    }
    return icon_noimage;
  };

  return (
    <View style={styles.card}>
      <Image
        source={book.cover_edition_key || book.cover_i || book.isbn ? { uri: getCoverUri() } : icon_noimage}
        style={styles.image}
        resizeMode="cover"
      />
      <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit>
        {book.title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bookBackground,
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
    width: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
});

export default BookItemSuggestion;
