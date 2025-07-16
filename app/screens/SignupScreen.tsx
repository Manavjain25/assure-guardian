import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { supabase } from '../../lib/supabaseClient'; // Adjust the import path as needed
import { RootStackParamList } from '../../router/RouterScreen';
import ScreenContainer from '../components/ScreenContainer';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'User', value: 'user' },
    { label: 'Agent', value: 'agent' },
  ]);

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) return Alert.alert('Error signing up', error.message);

    // Insert role into the users table
    const { error: insertError } = await supabase.from('users').insert([
      { id: data.user?.id, email, role }
    ]);

    if (insertError) return Alert.alert('Signup succeeded, but role insert failed', insertError.message);

    Alert.alert('Success', 'Check your email to confirm your account.');
    navigation.navigate('Login');
  };



  return (
    <ScreenContainer noScroll={open}>
      <View style={[styles.inner, { zIndex: open ? 1000 : 1 }]}>
        <Text style={styles.title}>Create Your Account 🧬</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        <DropDownPicker
          open={open}
          value={role}
          items={items}
          setOpen={setOpen}
          setValue={setRole}
          setItems={setItems}
          placeholder="Select role"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
        />

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text onPress={() => navigation.navigate('Login')} style={styles.link}>
          Already have an account? Log in
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  inner: {
    width: '100%',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  dropdown: {
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
  },
  dropdownContainer: {
    backgroundColor: '#f0f0f0',
    zIndex: 1000,
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  link: {
    marginTop: 20,
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 15,
  },
});
