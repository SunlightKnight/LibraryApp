import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Button } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';

// Functions, variables, and type imports
import { useTranslation } from 'react-i18next';
import { login } from '../services/models/Login';
import i18n from '../localization/i18n';

// Assets and styles imports
import colors from '../styles/colors';

// Services imports
import storage from '../services/StorageService';
import { useAuth } from '../services/AuthContext';
import { BackendServiceContext } from '../services/BackedServiceProvider';

interface LoginPagePopUpProps {
  isVisible: boolean;
  onClose: () => void;
  handleLoader: (isLoading: boolean) => void;
}

// Calcola la data predefinita (oggi - 13 anni)
const defaultBirthDate = new Date(new Date().setFullYear(new Date().getFullYear() - 13));

const LoginPagePopUp = ({ isVisible, onClose, handleLoader }: LoginPagePopUpProps) => {
  const { t } = useTranslation();
  const [isRegisterVisible, setRegisterVisible] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [surname, setSurname] = useState<string>('');
  // Imposta la data di nascita di default a 13 anni fa
  const [birthDate, setBirthDate] = useState<Date>(defaultBirthDate);
  const [email, setEmail] = useState<string>('');
  const [usernameState, setUsernameState] = useState<boolean>(true);
  const [passwordState, setPasswordState] = useState<boolean>(true);
  const [nameState, setNameState] = useState<boolean>(true);
  const [surnameState, setSurnameState] = useState<boolean>(true);
  const [emailState, setEmailState] = useState<boolean>(true);
  const [informationError, setInformationError] = useState<boolean>(false);
  const [informationDuplicated, setInformationDuplicated] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const { login, authState } = useAuth();
  const backendService = useContext(BackendServiceContext);

  const validateField = async (field: string, type: 'username' | 'password' | 'email' | 'name' | 'surname'): Promise<boolean> => {
    const noSpecialChars = /^[a-zA-Z0-9]*$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9]{8,25}$/;
  
    if (type === 'username') {
      return field.length >= 8 && field.length <= 16 && !field.includes(' ') && noSpecialChars.test(field);
    }
  
    if (type === 'password') {
      return passwordRegex.test(field);
    }
  
    if (type === 'email') {
      return field.length >= 8 && field.length <= 64 && !field.includes(' ') && emailRegex.test(field);
    }
  
    if (type === 'name' || type === 'surname') {
      return field.length >= 3 && field.length <= 25 && noSpecialChars.test(field);
    }
  
    return true;
  };

  useEffect(() => {
    const validateUsername = async () => {
      const isValid = await validateField(username, 'username');
      setUsernameState(isValid);
    };
    validateUsername();
  }, [username]);
  
  useEffect(() => {
    const validatePassword = async () => {
      const isValid = await validateField(password, 'password');
      setPasswordState(isValid);
    };
    validatePassword();
  }, [password]);
  
  useEffect(() => {
    const validateEmail = async () => {
      const isValid = await validateField(email, 'email');
      setEmailState(isValid);
    };
    validateEmail();
  }, [email]);
  
  useEffect(() => {
    const validateName = async () => {
      const isValid = await validateField(name, 'name');
      setNameState(isValid);
    };
    validateName();
  }, [name]);
  
  useEffect(() => {
    const validateSurname = async () => {
      const isValid = await validateField(surname, 'surname');
      setSurnameState(isValid);
    };
    validateSurname();
  }, [surname]);
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };
  
  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    return date.toLocaleDateString(i18n.language);
  };

  // Correggi la sezione handleLogin:
  const handleLogin = async (user: login) => {
    handleLoader(true);
    if (!usernameState || !passwordState) {
      handleLoader(false);
      return;
    }
    try {
      const response = await backendService?.beService.loginUser(user.username, user.password);
      if (response) {
        await storage.save({
          key: 'lastUser',
          data: response
        });
        login(response);
        onClose();
      }
    } catch (error) {
      console.error('Login error:', error);
      setInformationError(true);
    } finally {
      handleLoader(false);
    }
  };

  const handleRegistration = async () => {
    handleLoader(true);
    if (!emailState || !nameState || !passwordState || !surnameState || !usernameState) {
      handleLoader(false);
      return;
    }
    try {
      const tempLogin: login = {
        username,
        password,
        email,
        personal_info: {
          date_of_birth: birthDate,
          name,
          surname,
        },
        recent_book: null,
        liked_books: null,
      };
      backendService?.beService.registerUser(tempLogin)
        .then((response) => {
          onClose();
          setRegisterVisible(false);
          handleLoader(false);
          handleLogin(response);
        })
        .catch((error) => {
          handleLoader(false);
          if (error.status === 400) {
            setInformationDuplicated(true);
          } else {
            console.error('Registration error:', error);
          }
        });
    } catch (error) {
      handleLoader(false);
      console.error('Errore nella registrazione:', error);
    }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('login_page.page')}</Text>
          <TextInput
            placeholder={t('login_page.username')}
            style={styles.inputContent}
            placeholderTextColor={colors.black}
            value={username}
            onChangeText={setUsername}
          />
          {!usernameState && <Text style={{ color: colors.red }}>{t("login_page.invalid_username")}</Text>}
          <TextInput
            placeholder={t('login_page.password')}
            style={styles.inputContent}
            placeholderTextColor={colors.black}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />
          {!passwordState && <Text style={{ color: colors.red }}>{t("login_page.invalid_password")}</Text>}
          {informationError && <Text style={{ color: colors.red, marginBottom: 10, marginTop: 10 }}>{t('login_page.invalid_credentials')}</Text>}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: usernameState && passwordState ? colors.primary : colors.grey }]}
              disabled={!usernameState || !passwordState}
              onPress={() => handleLogin({ username, password, email, personal_info: { name, surname, date_of_birth: birthDate }, recent_book: null, liked_books: [] })}
            >
              <Text style={styles.loginButtonText}>{t('login_page.login')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginButton} onPress={() => setRegisterVisible(true)}>
              <Text style={styles.loginButtonText}>{t('login_page.register')}</Text>
            </TouchableOpacity>
          </View>
          <Modal animationType="fade" transparent={true} visible={isRegisterVisible} onRequestClose={() => setRegisterVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <TouchableOpacity onPress={() => setRegisterVisible(false)} style={{ alignSelf: 'flex-end' }} >
                  <Text style={{ color: colors.black }}>{t('login_page.close')}</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{t('login_page.register')}</Text>
                <TextInput
                  placeholder={t('login_page.registration.name')}
                  style={styles.inputContent}
                  placeholderTextColor={colors.black}
                  value={name}
                  onChangeText={setName}
                />
                {!nameState && <Text style={{ color: colors.red }}>{t("login_page.invalid_name")}</Text>}
                <TextInput
                  placeholder={t('login_page.registration.surname')}
                  style={styles.inputContent}
                  placeholderTextColor={colors.black}
                  value={surname}
                  onChangeText={setSurname}
                />
                {!surnameState && <Text style={{ color: colors.red }}>{t("login_page.invalid_surname")}</Text>}
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputContent}>
                  <Text style={{ marginTop: 10 }}>{birthDate ? formatDate(birthDate) : t('login_page.registration.birth_date')}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={birthDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={defaultBirthDate}
                    minimumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 100))}
                  />
                )}
                <TextInput
                  placeholder={t('login_page.registration.email')}
                  style={styles.inputContent}
                  placeholderTextColor={colors.black}
                  value={email}
                  onChangeText={setEmail}
                />
                {!emailState && <Text style={{ color: colors.red }}>{t("login_page.invalid_email")}</Text>}
                <TextInput
                  placeholder={t('login_page.username')}
                  style={styles.inputContent}
                  placeholderTextColor={colors.black}
                  value={username}
                  onChangeText={(text) => setUsername(text)}
                />
                {!usernameState && <Text style={{ color: colors.red }}>{t("login_page.invalid_username")}</Text>}
                <TextInput
                  placeholder={t('login_page.password')}
                  style={styles.inputContent}
                  placeholderTextColor={colors.black}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                />
                {!passwordState && <Text style={{ color: colors.red }}>{t("login_page.invalid_password")}</Text>}
                <View style={{ marginTop: 16 }}>
                  <Button title={t('login_page.register')} onPress={handleRegistration} color={colors.primary} />
                </View>
                {informationDuplicated && <Text style={{ color: colors.red, marginBottom: 10, marginTop: 10 }}>{t('login_page.already_used_credentials')}</Text>}
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
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
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  inputContent: {
    marginTop: 16,
    backgroundColor: colors.grey,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    color: colors.black,
  },
  modalTitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loginButton: {
    flex: 1,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    padding: 12,
    marginTop: 16,
    borderRadius: 8,
    alignItems: 'center',
    maxWidth: 120,
    elevation: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginPagePopUp;
