import React, { useContext, useEffect, useState } from 'react';
import BookPrincipalDetails from '../../components/BookPrincipalDetails';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList } from 'react-native';
import { OpenLibraryResponse, Doc } from '../../services/models/OpenLibraryResponse';
import { useTranslation } from 'react-i18next';
import * as AppConfig from '../../config/config';
import colors from '../../styles/colors';
import { icon_noimage } from '../../assets';
import { BackendServiceContext } from '../../services/BackedServiceProvider';
import { LinearGradient } from 'react-native-linear-gradient';

interface BookListProps {
  parentProps: {
    handleLoader: (isLoading: boolean) => void;
    loading: boolean;
    bookSearchQuery: string;
  };
  navigation: any;
}

function BookList({ parentProps, navigation }: BookListProps) {
  const { t } = useTranslation();
  const backendService = useContext(BackendServiceContext);

  const [searchBooks, setBooks] = useState<Doc[]>([]);
  const [openLibraryResponse, setOpenLibraryResponse] = useState<OpenLibraryResponse>();
  const [currentPage, setCurrentPage] = useState(1);
  const { handleLoader, loading, bookSearchQuery } = parentProps;

  useEffect(() => {
    setCurrentPage(1);
    getBookListFromTitle(bookSearchQuery, 1);
  }, [bookSearchQuery]);

  const getBookListFromTitle = async (query: string, page: number) => {
    handleLoader(page === 1);
    handleLoader(true);
    backendService?.beService
      .getBookList(query, page)
      .then((response) => {
        setBooks((prevBooks) => (page === 1 ? response.docs : [...prevBooks, ...response.docs]));
        setOpenLibraryResponse(response);
      })
      .finally(() => {
        handleLoader(false);
      });
  };

  const loadMoreBooks = () => {
    if (openLibraryResponse && openLibraryResponse.numFound > searchBooks.length) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      getBookListFromTitle(bookSearchQuery, nextPage);
    }
  };

  const renderBook = ({ item }: { item: Doc }) => {
    const coverUri = item.cover_edition_key
      ? `${AppConfig.COVER_ENDPOINT_EDITION_KEY}/${item.cover_edition_key}-M.jpg`
      : item.cover_i
      ? `${AppConfig.COVER_ENDPOINT_ID}/${item.cover_i}-M.jpg`
      : item.isbn
      ? `${AppConfig.COVER_ENDPOINT_ISBN}/${item.isbn}-M.jpg`
      : null;

    return (
      <TouchableOpacity onPress={() => navigation.navigate('BookDetail', { book: item })}>
        <View style={styles.bookItem}>
          <BookPrincipalDetails item={item} />
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={styles.bookCover} resizeMode="cover" />
          ) : (
            <View style={styles.noImage}>
              <Image source={icon_noimage} style={styles.bookCover} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header con gradiente */}
      <LinearGradient colors={[colors.primary, colors.bookContainerBackground]} style={styles.header}>
        <Text style={styles.headerTitle}>{t('search_result.results')}</Text>
        <Text style={styles.headerSubtitle}>
          {openLibraryResponse?.numFound || 0} {t('search_result.results')}
        </Text>
      </LinearGradient>

      <FlatList
        data={searchBooks}
        renderItem={renderBook}
        keyExtractor={(item, index) => item.key + index.toString()}
        onEndReached={loadMoreBooks}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingBox}>
              <Text style={styles.loadingText}>{t('book_list.loading_more')}</Text>
            </View>
          ) : null
        }
      />
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate('Homepage', { screen: 'Homepage' })}
      >
        <Text style={styles.homeButtonText}>{t('book_list.back_to_home')}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default BookList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.containerBackground || '#f5f5f5',
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  bookItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginLeft: 12,
  },
  noImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  loadingBox: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  homeButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    elevation: 5,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
