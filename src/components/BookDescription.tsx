import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Doc } from '../services/models/OpenLibraryResponse';
import colors from '../styles/colors';
import ModalPopUp from './ModalPopUp';

type BookDescriptionDetailsProp = {
  item: Doc;
};

const BookDescriptionDetails = ({ item }: BookDescriptionDetailsProp) => {
  const { t } = useTranslation();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const sortedGenres = item.subject ? [...item.subject].sort() : [];
  const sortedPublishers = item.publisher ? [...item.publisher].sort() : [];

  const renderListWithModal = (
    data: string[],
    label: string,
    modalKey: string
  ) => (
    <>
      <Text style={styles.subtitle}>{t(`book_description.${label}`)}:</Text>
      {data.length > 4 ? (
        <>
          <FlatList
            data={data.slice(0, 5)}
            renderItem={renderItem}
            horizontal
            keyExtractor={(item, index) => `${item}-${index}`}
            contentContainerStyle={styles.listContainer}
          />
          <TouchableOpacity onPress={() => setActiveModal(modalKey)}>
            <Text style={styles.reference}>{t('book_description.modals.see_more')}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          horizontal
          keyExtractor={(item, index) => `${item}-${index}`}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </>
  );

  return (
    <View>
      <Text style={styles.title}>{t('book_description.description')}</Text>
      <Text style={styles.subtitle}>
        {t('book_description.publish_date')}: <Text style={styles.text}>{item.first_publish_year || 'N/A'}</Text>
      </Text>

      {sortedPublishers.length > 0
        ? renderListWithModal(sortedPublishers, 'publishers', 'publishers')
        : (
          <Text style={styles.subtitle}>
            {t('book_description.publishers')}: <Text style={styles.text}>N/A</Text>
          </Text>
        )}

      {sortedGenres.length > 0
        ? renderListWithModal(sortedGenres, 'genre', 'genres')
        : (
          <Text style={styles.subtitle}>
            {t('book_description.genre')}: <Text style={styles.text}>N/A</Text>
          </Text>
        )}

      <Text style={styles.subtitle}>
        {t('book_description.languages')}: <Text style={styles.text}>{item.language?.toString() || 'N/A'}</Text>
      </Text>

      <Text style={styles.subtitle}>
        {t('book_description.rating')}: <Text style={styles.text}>
          {item.ratings_average ? `${item.ratings_average.toFixed(1)}/5` : t('book_description.rating_empty')}
        </Text>
      </Text>

      <Text style={styles.subtitle}>
        {t('book_description.pages')}: <Text style={styles.text}>{item.number_of_pages_median?.toFixed(0) || 'N/A'}</Text>
      </Text>

      <Text style={styles.subtitle}>
        {t('book_description.edition_count')}: <Text style={styles.text}>{item.edition_count || 'N/A'}</Text>
      </Text>

      {item.isbn && item.isbn.length > 0
        ? renderListWithModal(item.isbn, 'isbn', 'isbn')
        : (
          <Text style={styles.subtitle}>
            {t('book_description.isbn')}: <Text style={styles.text}>N/A</Text>
          </Text>
        )}

      {activeModal && (
        <ModalPopUp
          item={
            activeModal === 'publishers'
              ? sortedPublishers
              : activeModal === 'genres'
              ? sortedGenres
              : item.isbn || []
          }
          isVisible={true}
          suffix={activeModal}
          onClose={() => setActiveModal(null)}
        />
      )}
    </View>
  );
};

const renderItem = ({ item }: { item: string }) => (
  <Text style={styles.listItem}>{item}</Text>
);

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: '#333',
  },
  text: {
    fontSize: 14,
    color: '#555',
    marginLeft: 4,
  },
  reference: {
    fontSize: 14,
    fontWeight: 'normal',
    color: colors.black,
    textDecorationLine: 'underline',
    marginTop: 4,
  },
  listContainer: {
    marginTop: 4,
    paddingVertical: 4,
  },
  listItem: {
    fontSize: 14,
    marginRight: 8,
    backgroundColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
});

export default BookDescriptionDetails;
