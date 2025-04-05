import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../utils/supabase.config.js';
import { useRouter } from 'expo-router';
import LoadingScreen from '../../components/LoadingScreen';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAnonymousSignIn = () => {
    Alert.alert(
      'Tens a certeza?',
      'Sem uma conta não é possível avaliar cervejas.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Continuar',
          onPress: async () => {
            Alert.alert(
              'Custa muito criar conta?', '',
              [
                { text: 'Não, desculpa', style: 'cancel' },
                {
                  text: 'Sim, custa',
                  onPress: async () => {
                    setLoading(true);
                    try {
                      const { data, error } = await supabase.auth.signInAnonymously();
                      if (error) throw error;
                      router.push('/');
                    } catch (error) {
                      console.error("Erro ao entrar anonimamente:", error);
                      Alert.alert('Erro', error.message || 'Erro ao entrar anonimamente');
                    } finally {
                      setLoading(false);
                    }
                  },
                },
              ],
              { cancelable: true }
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEmailSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Identifique-se!');
      return;
    }

    setLoading(true);
    try {
      if (isSigningUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password
        });

        if (error) throw error;
        Alert.alert('A tua conta foi criada!');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) throw error;
      }
      router.push('/');
    } catch (error) {
      console.error("Erro ao entrar com email:", error);
      Alert.alert('Erro', error.message || 'Erro ao entrar com email');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Identifique-se!</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <Button
        title={isSigningUp ? "Registar" : "Entrar"}
        onPress={handleEmailSignIn}
        disabled={loading}
      />

      <Text style={styles.switchText}>
        {isSigningUp ? "Já tens uma conta? " : "Ainda não tens uma conta? "}
        <Text style={styles.link} onPress={() => setIsSigningUp(!isSigningUp)}>
          {isSigningUp ? "Entrar" : "Registar"}
        </Text>
      </Text>

      <Text style={styles.orText}>ou</Text>

      <Button
        title="Continuar como convidado"
        onPress={handleAnonymousSignIn}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  switchText: {
    marginVertical: 10,
    textAlign: 'center',
  },
  link: {
    color: 'blue',
    fontWeight: 'bold',
  },
  orText: {
    marginVertical: 20,
    textAlign: 'center',
    fontSize: 16,
  },
});