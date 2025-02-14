import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Button, Image } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import colors from '../styles/colors';
import { useAuth } from '../services/AuthContext';
import i18n from '../localization/i18n';
import { icon_back, icon_person } from '../assets';
import { BackendServiceContext } from '../services/BackedServiceProvider';

interface AccountInformationsProps {
  isVisible: boolean;
  onClose: () => void;
}

const AccountInformations = ({ isVisible, onClose }: AccountInformationsProps) => {
  const { t } = useTranslation();
  const { authState, logout } = useAuth();
  const backendService = useContext(BackendServiceContext);

  // Stati per il modal di conferma password e cambio password
  const [passwordRequested, setPasswordRequested] = useState(false);
  const [password, setPassword] = useState<string>('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [confirmationPassword, setConfirmationPassword] = useState<string>('');
  const [changedPassword, setChangedPassword] = useState<string>('');
  const [cannotChangePassword, setCannotChangePassword] = useState(false);

  // Reset degli stati quando il modal principale viene chiuso
  useEffect(() => {
    if (!isVisible) {
      setPasswordRequested(false);
      setPassword('');
      setIsPasswordCorrect(false);
      setChangePassword(false);
      setConfirmationPassword('');
      setChangedPassword('');
      setCannotChangePassword(false);
    }
  }, [isVisible]);

  const formatDate = (date?: string | Date): string => {
    if (!date) return '';
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(parsedDate.getTime())) return 'Data non valida';
    return parsedDate.toLocaleDateString(i18n.language);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleCheckPassword = () => {
    if (authState.user?.password === password) {
      setIsPasswordCorrect(true);
      setCannotChangePassword(false);
    } else {
      // Puoi mostrare un messaggio di errore specifico qui
      setCannotChangePassword(true);
    }
  };

  const handleChangePassword = () => {
    setPasswordRequested(false);
    setChangePassword(true);
  };

  const handleSetChangedPassword = () => {
    // Verifica che la password di conferma corrisponda a quella attuale
    if (authState.user?.password !== confirmationPassword) {
      setCannotChangePassword(true);
      return;
    }

    // Controllo della validità della nuova password
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9]{8,25}$/;
    if (!changedPassword || !passwordRegex.test(changedPassword)) {
      setCannotChangePassword(true);
      return;
    }

    if (authState.user?.username && authState.user.email) {
      const updatedUser = { ...authState.user, password: changedPassword };
      try {
        // Se updateUser è asincrono, valuta di usare async/await
        backendService?.beService.updateUser(updatedUser);
        onClose();
        logout();
      } catch (error) {
        console.log(error);
        setCannotChangePassword(true);
      }
    } else {
      setCannotChangePassword(true);
    }
  };

  const renderPersonalInfoModal = () => (
    <Modal visible={passwordRequested} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={{ maxWidth: 30 }} onPress={() => setPasswordRequested(false)}>
            <Image source={icon_back} style={{ width: 30, height: 30 }} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{t("account.personal_info")}</Text>
          {isPasswordCorrect ? (
            <>
              <Text>{t("account.name")}: {authState.user?.personal_info.name}</Text>
              <Text>{t("account.surname")}: {authState.user?.personal_info.surname}</Text>
              <Text>{t("account.birth_date")}: {formatDate(authState.user?.personal_info.date_of_birth)}</Text>
              {!changePassword && (
                <TouchableOpacity style={styles.changePassword} onPress={handleChangePassword}>
                  <Text style={styles.loginButtonText}>{t("account.change_password")}</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <TextInput
                placeholder={t("account.insert_password")}
                style={styles.inputContent}
                placeholderTextColor={colors.black}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity style={{ marginTop: 16 }} onPress={handleCheckPassword}>
                <Button title={t("account.next")} onPress={handleCheckPassword} color={colors.primary} />
              </TouchableOpacity>
              {cannotChangePassword && (
                <Text style={styles.errorText}>{t("account.error_password")}</Text>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderChangePasswordModal = () => (
    <Modal visible={changePassword} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={{ maxWidth: 30 }} onPress={() => setChangePassword(false)}>
            <Image source={icon_back} style={{ width: 30, height: 30 }} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{t("account.change_password")}</Text>
          <TextInput
            placeholder={t("account.insert_password")}
            style={styles.inputContent}
            placeholderTextColor={colors.black}
            value={confirmationPassword}
            onChangeText={setConfirmationPassword}
            secureTextEntry
          />
          <TextInput
            placeholder={t("account.insert_new_password")}
            style={styles.inputContent}
            placeholderTextColor={colors.black}
            value={changedPassword}
            onChangeText={setChangedPassword}
            secureTextEntry
          />
          <TouchableOpacity style={{ marginTop: 16 }} onPress={handleSetChangedPassword}>
            <Button title={t("account.next")} onPress={handleSetChangedPassword} color={colors.primary} />
          </TouchableOpacity>
          {cannotChangePassword && (
            <Text style={styles.errorText}>
              {t("account.error_changing_password")}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );

  if (!authState.isLoggedIn) return null;

  return (
    <Modal animationType="fade" transparent visible={isVisible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={{ maxWidth: 30 }} onPress={onClose}>
            <Image source={icon_back} style={{ width: 30, height: 30 }} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {t("homepage.welcome")} {authState.user?.personal_info.name}!
          </Text>
          <Image source={icon_person} style={{ alignSelf: 'center', height: 50, width: 30 }} />
          <View style={styles.informationBox}>
            <Text style={styles.modalTitle}>{t("account.your_info")}</Text>
            <Text style={{ fontWeight: 'bold' }}>{t("account.account_info")}</Text>
            <Text>Username: {authState.user?.username}</Text>
            <Text>Email: {authState.user?.email}</Text>
            <TouchableOpacity onPress={() => setPasswordRequested(true)}>
              <View style = {{
                alignSelf: 'center',
                backgroundColor: colors.primary,
                padding: 12,
                marginTop: 16,
                borderRadius: 8,
                alignItems: 'center',
                maxWidth: 300,
                elevation: 5,
              }}>
                <Text style={styles.loginButtonText}>{t("account.personal_info")}</Text>
              </View>
            </TouchableOpacity>
            {renderPersonalInfoModal()}
            {renderChangePasswordModal()}
          </View>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogout}>
            <Text style={styles.loginButtonText}>Logout</Text>
          </TouchableOpacity>
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
    backgroundColor: colors.bookContainerBackground,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  informationBox: {
    margin: 10,
    padding: 20,
    backgroundColor: colors.white,
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
    marginVertical: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loginButton: {
    alignSelf: 'center',
    backgroundColor: colors.red,
    padding: 12,
    marginTop: 16,
    borderRadius: 8,
    alignItems: 'center',
    maxWidth: 120,
    elevation: 5,
  },
  changePassword: {
    alignSelf: 'center',
    backgroundColor: colors.primary,
    padding: 12,
    marginVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    maxWidth: 400,
    elevation: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AccountInformations;
