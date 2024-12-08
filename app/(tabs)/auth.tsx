import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';


export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const router = useRouter();

  console.log(FIREBASE_AUTH)
  Alert.alert(FIREBASE_AUTH)

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
                    try {
                      await signInAnonymously(FIREBASE_AUTH);
                      router.push('/')
                    } catch (error) {
                      console.error("Erro ao entrar anonimamente:", error);
                      Alert.alert('Erro ao entrar anonimamente');
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
    try {
      if (isSigningUp) {
        await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
        Alert.alert('A tua conta foi criada!');
      } else {
        await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      }
      router.push('/')
    } catch (error) {
      Alert.alert('Erro ao entrar com email', getErrorMessage(error));
    }
  };

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

      <Button title={isSigningUp ? "Registar" : "Entrar"} onPress={handleEmailSignIn} />

      <Text style={styles.switchText}>
        {isSigningUp ? "Já tens uma conta? " : "Ainda não tens uma conta? "}
        <Text style={styles.link} onPress={() => setIsSigningUp(!isSigningUp)}>
          {isSigningUp ? "Entrar" : "Registar"}
        </Text>
      </Text>

      <Text style={styles.orText}>ou</Text>

      <Button title="Continuar como convidado" onPress={handleAnonymousSignIn} />
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
