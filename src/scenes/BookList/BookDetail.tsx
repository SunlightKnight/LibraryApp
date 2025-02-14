import React, { useEffect, useState, useContext, useRef } from 'react';
import { View, ScrollView, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import BookPrincipalDetails from '../../components/BookPrincipalDetails';
import BookDescriptionDetails from '../../components/BookDescription';
import BookSuggestions from '../../components/BookSuggestions';
import LinearGradient from 'react-native-linear-gradient';
import { RouteProp } from '@react-navigation/native';
import { Doc } from '../../services/models/OpenLibraryResponse';
import * as AppConfig from '../../config/config';
import { icon_heart, icon_noimage, icon_red_heart } from '../../assets';
import { BackendServiceContext } from '../../services/BackedServiceProvider';
import { useAuth } from '../../services/AuthContext';
import colors from '../../styles/colors';

interface BookDetailProps {
  route: RouteProp<{ params: { book: Doc } }, 'params'>;
  navigation: any;
  parentProps: {
    handleLoader: (isLoading: boolean) => void;
  };
}

const BookDetail = ({ route, navigation, parentProps }: BookDetailProps) => {
  const { book } = route.params;
  const [sameAuthorsBooks, setSameAuthorsBooks] = useState<Doc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const backendService = useContext(BackendServiceContext);
  const scrollViewRef = useRef<ScrollView>(null);
  const { authState, login } = useAuth();
  const [isLiked, setIsLiked] = useState(false);

  // Salvataggio del libro tra i "recent" dell'utente
  const saveBookToRecent = async () => {
    if (!authState.user) return;
    const recent_book = authState.user.recent_book;
    if (recent_book && recent_book.title === book.title) return;
    const updatedUser = {
      ...authState.user,
      recent_book: {
        title: book.title,
        author: book.author_name ? book.author_name[0] : '',
        isbn: book.isbn ? book.isbn[0] : '',
        subject: book.subject ? book.subject[0] : ''
      }
    };
    login(updatedUser);
    try {
      await backendService?.beService.updateUser(updatedUser);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch dei libri dello stesso autore (con fallback a libri random)
  const fetchBooksByAuthor = async () => {
    if (book.author_name) {
      const authorSearchQuery = book.author_name[0].replace(/ /g, '+');
      parentProps.handleLoader(true);
      setIsLoading(true);
      try {
        const response = await backendService?.beService.getBookWithPrefixExtended(
          'author',
          authorSearchQuery,
          1,
          15
        );
        const books = response?.numFound !== 1 ? response?.docs : await fetchRandomBooks();
        setSameAuthorsBooks(books || []);
      } catch (error) {
        console.error('Errore nel recupero dei libri dello stesso autore:', error);
      } finally {
        setIsLoading(false);
        parentProps.handleLoader(false);
      }
    }
  };

  const fetchRandomBooks = async () => {
    const response = await backendService?.beService.getTwentyBooks();
    return response?.docs || [];
  };

  useEffect(() => {
    saveBookToRecent();
    fetchBooksByAuthor();
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });

    if (authState.user?.liked_books) {
      const isBookLiked = authState.user.liked_books.some((likedBook) => likedBook.title === book.title);
      setIsLiked(isBookLiked);
    } else {
      setIsLiked(false);
    }
  }, [book]);

  // Funzione per ottenere l'URI della copertina del libro
  const getCoverUri = () => {
    if (book.cover_edition_key) {
      return `${AppConfig.COVER_ENDPOINT_EDITION_KEY}/${book.cover_edition_key}-L.jpg`;
    }
    if (book.cover_i) {
      return `${AppConfig.COVER_ENDPOINT_ID}/${book.cover_i}-L.jpg`;
    }
    if (book.isbn) {
      return `${AppConfig.COVER_ENDPOINT_ISBN}/${book.isbn}-L.jpg`;
    }
    return icon_noimage;
  };

  return (
    <ScrollView style={styles.container} ref={scrollViewRef}>
      {/* Cover a piena larghezza */}
      <View style={styles.coverContainer}>
        <Image
          source={
            book.cover_edition_key || book.cover_i || book.isbn
              ? { uri: getCoverUri() }
              : icon_noimage
          }
          style={styles.bookCover}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', '#f5f5f5']}
          style={styles.gradientOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        <View style={styles.detailsOverlay}>
          <BookPrincipalDetails item={book} />
        </View>
        {/* Bottone like/dislike */}
        {!isLiked ? (
          authState.user &&
          authState.user.liked_books &&
          authState.user.liked_books.length >= 50 ? (
            <Text style={styles.limitText}>Limite preferiti raggiunto</Text>
          ) : (
            <TouchableOpacity
              onPress={async () => {
                if (authState.user && authState.user.username) {
                  setIsLiked(true);
                  const updatedUser = JSON.parse(JSON.stringify(authState.user));
                  updatedUser.liked_books = [
                    ...(authState.user?.liked_books || []),
                    {
                      title: book.title,
                      author: book.author_name ? book.author_name[0] : '',
                      isbn: book.isbn ? book.isbn[0] : ''
                    }
                  ];
                  try {
                    await backendService?.beService.updateUser(updatedUser);
                  } catch (error) {
                    console.log(error);
                  }
                  login(updatedUser);
                }
              }}
              style={styles.heartButton}
            >
              <Image source={icon_heart} style={styles.heartIcon} />
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity
            onPress={async () => {
              if (authState.user && authState.user.username) {
                setIsLiked(false);
                const updatedUser = {
                  ...authState.user,
                  liked_books:
                    authState.user?.liked_books?.filter((likedBook) => likedBook.title !== book.title) || [],
                };
                try {
                  await backendService?.beService.updateUser(updatedUser);
                } catch (error) {
                  console.log(error);
                }
                login(updatedUser);
              }
            }}
            style={styles.heartButton}
          >
            <Image source={icon_red_heart} style={styles.heartIcon} />
          </TouchableOpacity>
        )}
      </View>

      {/* Sezione descrizione */}
      <View style={styles.contentWrapper}>
        <BookDescriptionDetails item={book} />
      </View>

      {/* Suggerimenti */}
      <View style={styles.contentWrapper}>
        <BookSuggestions
          books={sameAuthorsBooks.filter((item) => item.title !== book.title)}
          navigation={navigation}
          title="other_ones"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  coverContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  bookCover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  detailsOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  heartButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 2,
  },
  heartIcon: {
    height: 30,
    width: 30,
  },
  limitText: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  contentWrapper: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default BookDetail;
