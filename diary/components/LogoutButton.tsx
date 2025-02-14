import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';

export function LogoutButton() {
  const iconColor = useThemeColor({}, 'text');

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/auth');
    } catch (error) {
      console.error('Помилка виходу:', error);
    }
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={styles.container}>
      <MaterialIcons name="logout" size={24} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 15,
  },
});