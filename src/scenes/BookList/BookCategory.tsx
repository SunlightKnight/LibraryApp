import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Doc, OpenLibraryResponse } from '../../services/models/OpenLibraryResponse';
import { BackendServiceContext } from '../../services/BackedServiceProvider';
import * as AppConfig from '../../config/config';
import { icon_noimage } from '../../assets';
import colors from '../../styles/colors';
import { LinearGradient } from 'react-native-linear-gradient';

interface BookCategoryProps {
  route: {
    params: {
      category: string;
    };
  };
  parentProps: {
    handleLoader: (isLoading: boolean) => void;
  };
  navigation: any;
}

const BookCategory = ({ route, navigation, parentProps }: BookCategoryProps) => {
  const { t } = useTranslation();
  const { category } = route.params;
  const [books, setBooks] = useState<Doc[]>([]);
  const [openLibraryResponse, setOpenLibraryResponse] = useState<OpenLibraryResponse>();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortOption, setSortOption] = useState<string>('');
  const [showSortOptions, setShowSortOptions] = useState<boolean>(false);
  const backendService = useContext(BackendServiceContext);

  // Array delle opzioni di ordinamento
  const sortOptions = [
    { label: t("sort_by.publish_date"), value: 'publication_date' },
    { label: t("sort_by.author"), value: 'author' },
    { label: t("sort_by.title"), value: 'title' },
    { label: t("sort_by.page_number"), value: 'pages' },
    { label: t("sort_by.rating"), value: 'rating' },
  ];

  // Recupero dei libri usando la categoria come query
  const fetchBooks = async (page: number) => {
    setLoading(true);
    parentProps.handleLoader(true);
    try {
      const result = await backendService?.beService.getBookList(category, page);
      if (result) {
        setOpenLibraryResponse(result);
        const newBooks = page === 1 ? result.docs : [...books, ...result.docs];
        if (sortOption) {
          setBooks(sortBooks(newBooks, sortOption));
        } else {
          setBooks(newBooks);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      parentProps.handleLoader(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchBooks(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const loadMoreBooks = () => {
    if (openLibraryResponse && openLibraryResponse.numFound > books.length) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchBooks(nextPage);
    }
  };

  // Ordinamento dei libri in base all'opzione scelta
  const sortBooks = (booksToSort: Doc[], option: string): Doc[] => {
    return [...booksToSort].sort((a, b) => {
      switch (option) {
        case 'publication_date':
          return (a.first_publish_year || 0) - (b.first_publish_year || 0);
        case 'author': {
          const aAuthor = a.author_name && a.author_name.length > 0 ? a.author_name[0] : '';
          const bAuthor = b.author_name && b.author_name.length > 0 ? b.author_name[0] : '';
          return aAuthor.localeCompare(bAuthor);
        }
        case 'title':
          return a.title.localeCompare(b.title);
        case 'pages':
          return (a.number_of_pages_median || 0) - (b.number_of_pages_median || 0);
        case 'rating':
          return (a.ratings_average || 0) - (b.ratings_average || 0);
        default:
          return 0;
      }
    });
  };

  // Handler per la selezione dell'opzione di ordinamento
  const handleSortOption = (option: string) => {
    setSortOption(option);
    const sortedBooks = sortBooks(books, option);
    setBooks(sortedBooks);
    setShowSortOptions(false);
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
          <View style={styles.detailsContainer}>
            <Text style={styles.bookTitle}>
              {item.title.length > 20 ? item.title.slice(0, 20) + '...' : item.title}
            </Text>
            {item.author_name && (
              <Text style={styles.bookAuthor}>{item.author_name.join(', ')}</Text>
            )}
          </View>
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
        <Text style={styles.resultsText}>
          {t('search_result.results')}: {openLibraryResponse?.numFound || 0}
        </Text>
        <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortOptions(true)}>
          <Text style={styles.sortButtonText}>{t("book_suggestions.order_by")}</Text>
        </TouchableOpacity>
      </LinearGradient>
      
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item, index) => `${item.key}-${index}`}
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

      {/* Modal per l'ordinamento */}
      {showSortOptions && (
        <Modal transparent={true} animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowSortOptions(false)}>
            <View style={styles.modalContainer}>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.modalOptionContainer}
                  onPress={() => handleSortOption(option.value)}
                >
                  <Text style={styles.modalOptionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

export default BookCategory;

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
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultsText: {
    fontSize: 16,
    color: '#f0f0f0',
    marginTop: 4,
  },
  sortButton: {
    marginTop: 12,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 3,
  },
  sortButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
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
  detailsContainer: {
    flex: 1,
    marginRight: 12,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#555',
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  noImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  modalOptionContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionText: {
    fontSize: 18,
    color: '#333',
  },
});
