import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { TextInput } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

interface AuthFormValues {
  email: string;
  password: string;
}

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Невірний формат email").required("Email обов'язковий"),
  password: Yup.string().min(6, "Пароль має бути не менше 6 символів").required("Пароль обов'язковий"),
});

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const { signIn, signUp, error: authError, loading } = useAuth();

  const handleAuth = async (values: AuthFormValues, { setSubmitting }: FormikHelpers<AuthFormValues>) => {
    console.log('handleAuth викликано'); // Додаємо логування
    try {
      console.log('Спроба авторизації з даними:', values);
      setSubmitting(true);

      if (isLogin) {
        console.log('Виконується вхід...');
        await signIn(values.email, values.password);
        router.replace('/(tabs)/ai-chat');
      } else {
        console.log('Виконується реєстрація...');
        await signUp(values.email, values.password);
        router.replace('/(tabs)/ai-chat');
      }
    } catch (error) {
      console.error('Помилка:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>
        {isLogin ? 'Вхід' : 'Реєстрація'}
      </ThemedText>

      <Formik<AuthFormValues>
        initialValues={{ email: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={handleAuth}
      >
        {(formikProps: FormikProps<AuthFormValues>) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formikProps.values.email}
              onChangeText={(text) => formikProps.setFieldValue('email', text)}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading && !formikProps.isSubmitting}
            />
            {formikProps.touched.email && formikProps.errors.email && (
              <ThemedText style={styles.errorText}>{formikProps.errors.email}</ThemedText>
            )}

            <TextInput
              style={styles.input}
              placeholder="Пароль"
              value={formikProps.values.password}
              onChangeText={(text) => formikProps.setFieldValue('password', text)}
              secureTextEntry
              editable={!loading && !formikProps.isSubmitting}
            />
            {formikProps.touched.password && formikProps.errors.password && (
              <ThemedText style={styles.errorText}>{formikProps.errors.password}</ThemedText>
            )}

            {authError && (
              <ThemedText style={styles.errorText}>{authError.message}</ThemedText>
            )}

            <TouchableOpacity 
              style={[styles.button, (loading || formikProps.isSubmitting) && styles.buttonDisabled]} 
              onPress={() => {
                console.log('Кнопка натиснута'); // Додаємо логування
                formikProps.handleSubmit();
              }}
              disabled={loading || formikProps.isSubmitting}
            >
              <ThemedText style={styles.buttonText}>
                {(loading || formikProps.isSubmitting) ? 'Завантаження...' : isLogin ? 'Увійти' : 'Зареєструватися'}
              </ThemedText>
            </TouchableOpacity>
          </>
        )}
      </Formik>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} disabled={loading}>
        <ThemedText style={styles.switchText}>
          {isLogin ? 'Немає акаунту? Зареєструватися' : 'Вже є акаунт? Увійти'}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  switchText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#0066cc',
  },
});