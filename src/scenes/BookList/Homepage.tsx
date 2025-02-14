import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'react-native-linear-gradient'

import BookSuggestions from '../../components/BookSuggestions';
import LoginPagePopUp from '../../components/LoginPagePopUp';
import AccountInformations from '../../components/AccountInformations';

import { icon_person } from '../../assets';
import colors from '../../styles/colors';

import { BackendServiceContext } from '../../services/BackedServiceProvider';
import { useAuth } from '../../services/AuthContext';
import storage from '../../services/StorageService';
import { Doc } from '../../services/models/OpenLibraryResponse';
import { recent_book, liked_book } from '../../services/models/Login';

interface HomePageProps {
  parentProps: {
    handleLoader: (isLoading: boolean) => void;
    handleSearch: (query: string) => void;
    handleErrorLoader: (error: boolean) => void;
    setCurrentCategory : (title : string) => void,
    connectionError: boolean;
    loading: boolean;
  };
  navigation: any;
}

const CATEGORY_KEYS = ['fantasy', 'horror', 'thriller', 'biographical', 'adventure'];

function HomePage({ parentProps, navigation }: HomePageProps) {
  const { t } = useTranslation();
  const backendService = useContext(BackendServiceContext);
  const { authState, login } = useAuth();
  const { handleLoader, handleErrorLoader, connectionError, loading, setCurrentCategory} = parentProps;

  const [categories, setCategories] = useState<{ [key: string]: Doc[] }>({});
  const [suggestedBooks, setSuggestedBooks] = useState<Doc[]>([]);
  const [likedBooks, setLikedBooks] = useState<Doc[]>([]);
  const [isAccountVisible, setIsAccountVisible] = useState<boolean>(false);

  const fetchCategories = async () => {
    try {
      const results = await Promise.all(
        CATEGORY_KEYS.map((key) =>
          backendService?.beService
            .getBookWithPrefix('subject', key)
            .then((response) => ({ [key]: response.docs }))
        )
      );
      const categoriesData = results.reduce((acc, category) => ({ ...acc, ...category }), {});
      if (categoriesData) setCategories(categoriesData);
    } catch (error) {
      console.error('Errore nella fetch delle categorie:', error);
      handleErrorLoader(true);
    }
  };

  const fetchSuggestedBooks = async () => {
    if (authState.isLoggedIn && authState.user?.recent_book?.subject) {
      try {
        const subject = authState.user.recent_book.subject.replace(/ /g, '+');
        const result = await backendService?.beService.getBookWithPrefix('subject', subject);
        setSuggestedBooks(result?.docs || []);
      } catch (error) {
        console.error('Errore nel recupero dei suggerimenti:', error);
      }
    }
  };

  const fetchLikedBooks = async () => {
    if (authState.isLoggedIn && authState.user?.liked_books && authState.user.liked_books.length > 0) {
      try {
        const results = await Promise.all(
          authState.user.liked_books.map((book: liked_book) =>
            backendService?.beService.getBookFromAuthorAndTitle(
              book.title.replace(/ /g, '+').toLowerCase(),
              book.author?.replace(/ /g, '+').toLowerCase() || ''
            )
          )
        );
        const fetchedLikedBooks = results.reduce((acc: Doc[], res) => {
          if (res?.docs && res.docs.length > 0) {
            acc.push(res.docs[0]);
          }
          return acc;
        }, []);
        setLikedBooks(fetchedLikedBooks);
      } catch (error) {
        console.error('Errore nel recupero dei libri preferiti:', error);
      }
    } else {
      setLikedBooks([]);
    }
  };

  const handleFindLastUser = async () => {
    const user = await storage.load({ key: 'lastUser' });
    backendService?.beService
      .loginUser(user.username, user.password)
      .then((result) => {
        login(result);
        handleLoader(false);
      })
      .catch((error) => {
        console.log(error);
        handleLoader(false);
      });
  };

  useFocusEffect(
    useCallback(() => {
      handleLoader(true);
      if (!authState.isLoggedIn) {
        handleFindLastUser();
      }
      Promise.all([fetchCategories(), fetchSuggestedBooks(), fetchLikedBooks()])
        .catch((error) => console.error('Errore nella fetch dei dati HomePage:', error))
        .finally(() => handleLoader(false));

      let interval: NodeJS.Timeout | undefined;
      if (connectionError) {
        interval = setInterval(() => {
          fetchCategories();
          fetchSuggestedBooks();
          fetchLikedBooks();
        }, 30000);
      }
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [authState.user, connectionError])
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header con gradiente */}
      <LinearGradient colors={[colors.primary, colors.bookContainerBackground]} style={styles.header}>
        <TouchableOpacity style={styles.profileButton} onPress={() => setIsAccountVisible(true)}>
          <Image source={icon_person} style={styles.profileIcon} />
          <Text style={styles.headerText}>
            {t('homepage.welcome')} {authState.user?.personal_info.name}!
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {authState.isLoggedIn && (
        <AccountInformations isVisible={isAccountVisible} onClose={() => setIsAccountVisible(false)} />
      )}

      <LoginPagePopUp
        isVisible={!loading && !connectionError && !authState.isLoggedIn}
        onClose={() => {}}
        handleLoader={handleLoader}
      />

      {/* Sezione Categorie */}
      <View style={styles.sectionContainer}>
        {CATEGORY_KEYS.map((key) => (
          <View key={key} style={styles.card}>
            <BookSuggestions books={categories[key]} navigation={navigation} title={key} />
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('BookCategory', { category: key, parentProps: handleLoader })
                setCurrentCategory(key)}
              }
            >
              <Text style={styles.seeMore}>{t('book_description.modals.see_more')}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Sezione Suggerimenti */}
      {authState.isLoggedIn && suggestedBooks.length > 0 && (
        <View style={styles.card}>
          <BookSuggestions books={suggestedBooks} navigation={navigation} title={t('other_ones')} />
        </View>
      )}

      {/* Sezione Libri Preferiti */}
      {authState.isLoggedIn && likedBooks.length > 0 && (
        <View style={styles.card}>
          <BookSuggestions books={likedBooks} navigation={navigation} title={t('liked_books')} />
        </View>
      )}
    </ScrollView>
  );
}

export default HomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.containerBackground,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerText: {
    fontSize: 20,
    color: colors.black,
    fontWeight: 'bold',
  },
  sectionContainer: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: colors.bookContainerBackground,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  seeMore: {
    textAlign: 'right',
    color: colors.primary,
    marginTop: 8,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
