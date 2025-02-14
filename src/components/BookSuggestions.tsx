import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Doc } from '../services/models/OpenLibraryResponse';
import BookItemSuggestion from './BookItemSuggestion';
import colors from '../styles/colors';

interface BookSuggestionsProps {
  books: Doc[];
  navigation: any;
  title: string;
}

const BookSuggestions = ({ books, navigation, title }: BookSuggestionsProps) => {
  const { t } = useTranslation();

  const renderItem = ({ item }: { item: Doc }) => (
    <TouchableOpacity onPress={() => navigation.navigate('BookDetail', { book: item })}>
      <BookItemSuggestion book={item} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t(`book_suggestions.${title}`)}:</Text>
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  flatList: {
    paddingLeft: 8,
    marginBottom:10
  },
});

export default BookSuggestions;
