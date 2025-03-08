import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Pressable,
  TextInput,
  Text,
  Button,
  TouchableOpacity,
  Image,
} from 'react-native';
import { supabase } from '../../utils/supabase.config';
import Constants from 'expo-constants';
import { IconSymbol } from '@/components/ui/IconSymbol';

const UserProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
      } else {
        setUser(data?.user);
      }
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <View style={styles.container}>
      {user?.user_metadata?.avatar_url ? (
        <Image source={{ uri: user.user_metadata.avatar_url }} style={styles.profileImage} />
      ) : (
        <View style={styles.placeholderImage} />
      )}
      <Text style={styles.name}>{user?.user_metadata?.display_name || "Anonymous"}</Text>
      <Text style={styles.email}>{user?.email || "No email linked"}</Text>

      {__DEV__ && (
        <View style={styles.infoContainer}>
          <Text style={styles.debug}>DEBUG</Text>

          <Text style={styles.infoLabel}>User ID:</Text>
          <Text style={styles.infoText}>{user?.id}</Text>

          <Text style={styles.infoLabel}>Email Verified:</Text>
          <Text style={styles.infoText}>{user?.email_confirmed_at ? 'Yes ✅' : 'No ❌'}</Text>

          {user?.phone && (
            <>
              <Text style={styles.infoLabel}>Phone Number:</Text>
              <Text style={styles.infoText}>{user.phone}</Text>
            </>
          )}

          {!user?.app_metadata?.provider ? (
            <Text style={styles.infoLabel}> ⚠️ Guest User</Text>
          ) : (
            <>
              <Text style={styles.infoLabel}>Sign-in Provider:</Text>
              <Text style={styles.infoText}>{user?.app_metadata.provider}</Text>
            </>
          )}

          <Text style={styles.infoLabel}>Last Login:</Text>
          <Text style={styles.infoText}>{user?.last_sign_in_at}</Text>

          <Text style={styles.infoLabel}>Account Created:</Text>
          <Text style={styles.infoText}>{user?.created_at}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <IconSymbol name="signout" style={styles.icon} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.versionContainer}>
        <Text style={styles.appVersion}>App Version: {Constants.expoConfig?.version} (build {Constants.expoConfig?.extra?.buildNumber})</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f7f7",
    padding: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    marginTop: 30,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ccc",
    marginBottom: 20,
    marginTop: 30,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "gray",
    marginBottom: 20,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "blue",
    gap: 10,
    borderRadius: 5,
  },
  icon: {
    marginLeft: 10,
    fontSize: 20,
    color: "#fff",
  },
  signOutText: {
    marginRight: 10,
    fontSize: 16,
    color: "#fff",
  },
  infoContainer: {
    width: "100%",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  debug: {
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#555",
  },
  versionContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20,
  },
  appVersion: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
});

export default UserProfileScreen;