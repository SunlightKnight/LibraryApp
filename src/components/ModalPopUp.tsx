import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import colors from '../styles/colors';

const ModalPopUp = ({item,isVisible,onClose,suffix}: {item: string[];isVisible: boolean;onClose: () => void;suffix: string}) => {
    const { t } = useTranslation()  

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t(`book_description.${suffix}`)}:</Text>
            <FlatList
              data={item}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
            />
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>{t("book_description.modals.close")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

export default ModalPopUp;

const renderItem = ({ item }: { item: string }) => {
  return <Text>{item}</Text>;
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '90%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    color: '#333',
    marginTop: 5,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 10,
    marginTop: 5,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
