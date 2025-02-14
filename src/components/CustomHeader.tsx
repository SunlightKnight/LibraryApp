import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity,Keyboard, Image,StyleSheet } from 'react-native';
import { icon_search } from '../assets';
import { useTranslation } from 'react-i18next';
import colors from '../styles/colors';
import { HEADER_HEIGHT } from '../styles/styles';

interface CustomHeaderProps {
  onSearch?: (query: string) => void;
  title? : string
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: colors.primary,
    height : HEADER_HEIGHT,
    width : '100%',
    padding: 16,
    paddingTop : 80
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: colors.black,
  },
  searchButton: {
    padding: 8,
  },
  searchIcon: {
    width: 24,
    height: 24,
    tintColor: colors.primary,
  },
  titleText:{
    fontSize : 30,
    color : 'white',
    alignSelf:'center',
    fontWeight: 'bold'
  }
});

const CustomHeader = ({ onSearch, title}: CustomHeaderProps) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    Keyboard.dismiss()
    let modifiedSearchQuery = searchQuery.replace(/ /g, '+');
    console.log(modifiedSearchQuery);
    if (onSearch) {
      onSearch(modifiedSearchQuery);
    }
  };

  return (
    <View style={styles.headerContainer}>
        {title ? (<Text style={styles.titleText}>{t(`book_suggestions.${title}`)}</Text>) : (<></>)}
        {onSearch ? (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={t("search.placeholder")}
              placeholderTextColor={colors.primary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={handleSearch} style = {styles.searchButton}>
              <Image source={icon_search} style={styles.searchIcon} />
            </TouchableOpacity>
          </View>
        ) : (<></>)}
      </View>
  );
};



export default CustomHeader;