import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { TextInput } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { SendButton } from '@/components/buttons/SendButton';
import { EmailInput } from '@/components/inputs/user/EmailInput';
import { PasswordInput } from '@/components/inputs/user/PasswordInput';
import { STYLES } from '@/constants/STYLES';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { useTheme } from '@/hooks/useTheme';
import { useApi } from '@/hooks/useApi';
import { useSnackbar } from '@/hooks/useSnackbar';
import { getText } from '@/utils/getText';

type Step = 'email' | 'code' | 'password';

/**
 * Odzyskiwanie hasła – odpowiednik front `ForgotPassword`: e-mail → 6-cyfrowy kod z e-maila →
 * nowe hasło (POST /auth/forgotPassword, /auth/verifyResetCode, /auth/resetPassword).
 */
const ForgotPassword: React.FC = () => {
    const { colors } = useTheme();
    const { showSnackbar } = useSnackbar();
    const { loading, fetchData } = useApi();
    // e-mail wpisany na ekranie logowania – żeby nie trzeba było go przepisywać
    const params = useLocalSearchParams<{ email?: string }>();

    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState<string>(params.email ?? '');
    const [code, setCode] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const sendEmail = (): void => {
        fetchData(API_ENDPOINTS.forgotPassword, { method: 'POST', sendData: { email: email.trim() } }, { showSnackbar })
            .then((res) => {
                if (res.success) {
                    showSnackbar(getText('common', 'forgotPasswordSent'), 'success');
                    setCode('');
                    setStep('code');
                }
            });
    };

    const sendCode = (): void => {
        fetchData(API_ENDPOINTS.verifyResetCode, { method: 'POST', sendData: { email: email.trim(), code } }, { showSnackbar })
            .then((res) => {
                if (res.success) setStep('password');
            });
    };

    const sendNewPassword = (): void => {
        fetchData(API_ENDPOINTS.resetPassword, { method: 'POST', sendData: { email: email.trim(), code, password } }, { showSnackbar })
            .then((res) => {
                if (res.success) {
                    showSnackbar(getText('common', 'resetPasswordSuccess'), 'success');
                    router.back();
                }
            });
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                style={[STYLES.scrollView, { backgroundColor: colors.background }]}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                {step === 'email' && (
                    <View>
                        <ThemedText style={styles.info}>{getText('common', 'forgotPasswordEmailInfo')}</ThemedText>
                        <EmailInput value={email} onChange={setEmail} />
                        <SendButton onPress={sendEmail} text={getText('common', 'forgotPasswordSubmit')} loading={loading} />
                    </View>
                )}

                {step === 'code' && (
                    <View>
                        <ThemedText style={styles.info}>{getText('common', 'forgotPasswordSent')}</ThemedText>
                        <TextInput
                            style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
                            theme={{ colors: { primary: colors.text } }}
                            label={getText('common', 'resetCodeLabel')}
                            value={code}
                            onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
                            keyboardType="number-pad"
                            autoComplete="one-time-code"
                            textContentType="oneTimeCode"
                            textColor={colors.text}
                            maxLength={6}
                        />
                        {code.length === 6 &&
                            <SendButton onPress={sendCode} text={getText('common', 'resetCodeSubmit')} loading={loading} />}
                        <ThemedText type="link" style={styles.link} onPress={sendEmail}>
                            {getText('common', 'resetCodeResend')}
                        </ThemedText>
                    </View>
                )}

                {step === 'password' && (
                    <View>
                        <ThemedText style={styles.info}>{getText('common', 'resetPasswordInfo')}</ThemedText>
                        <PasswordInput value={password} onChange={setPassword} showHelper />
                        <SendButton onPress={sendNewPassword} text={getText('common', 'resetPasswordSubmit')} loading={loading} />
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    content: { flexGrow: 1, padding: 10, marginHorizontal: 30, paddingTop: 30, paddingBottom: 120 },
    info: { textAlign: 'center', marginBottom: 12 },
    link: { alignSelf: 'center', marginTop: 4 },
});

export default ForgotPassword;
