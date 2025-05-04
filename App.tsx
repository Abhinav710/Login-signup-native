import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, Switch, TouchableOpacity, ActivityIndicator, Platform, ImageBackground, Dimensions, PermissionsAndroid, Linking } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome'; // ✅ Added FontAwesome Icons
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

// Initialize biometrics
const rnBiometrics = new ReactNativeBiometrics();

// Type Definitions
type UserType = {
  username: string;
  password: string;
  role: string;
};

type RootStackParamList = {
  AppLock: undefined;
  Register: undefined;
  Login: undefined;
  Main: { user: UserType };
};

type MainRouteProp = RouteProp<RootStackParamList, 'Main'>;

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Custom Button with gradient effect
const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress, color = '#4CAF50' }) => (
  <TouchableOpacity 
    onPress={onPress} 
    activeOpacity={0.7} 
    style={styles.buttonContainer}
  >
    <View style={[styles.customButton, { backgroundColor: color }, styles.buttonShadow]}>
      <Text style={styles.customButtonText}>{title}</Text>
    </View>
  </TouchableOpacity>
);

// Logout Button
const LogoutButton: React.FC = () => {
  const navigation = useNavigation<any>();
  return (
    <CustomButton
      title="Logout"
      onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
      color="#FF5252"
    />
  );
};

// Registration Screen
type RegistrationScreenProps = StackScreenProps<RootStackParamList, 'Register'>;
const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');

  const handleRegister = async () => {
    try {
      const response = await fetch('http://192.168.1.7:3001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', data.message);
        navigation.navigate('Login');
      } else {
        Alert.alert('Registration Failed', data.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={[styles.stylishBackground, { backgroundColor: '#303F9F' }]}>
      <View style={styles.loginOverlay}>
        <View style={styles.loginCard}>
          <View style={styles.loginHeaderContainer}>
            <Text style={styles.loginHeader}>Create Account</Text>
            <Text style={styles.loginSubheader}>Join our secure platform</Text>
          </View>
          
          <View style={styles.stylishInputContainer}>
            <Icon name="user" size={20} color="#4A6FFF" style={styles.stylishInputIcon} />
            <TextInput 
              placeholder="Username" 
              placeholderTextColor="#9DA3B4" 
              value={username} 
              onChangeText={setUsername} 
              style={styles.stylishInput} 
            />
          </View>
          
          <View style={styles.stylishInputContainer}>
            <Icon name="envelope" size={20} color="#4A6FFF" style={styles.stylishInputIcon} />
            <TextInput 
              placeholder="Email" 
              placeholderTextColor="#9DA3B4" 
              value={email} 
              onChangeText={setEmail} 
              style={styles.stylishInput}
              keyboardType="email-address"
            />
          </View>
          
          <View style={styles.stylishInputContainer}>
            <Icon name="lock" size={20} color="#4A6FFF" style={styles.stylishInputIcon} />
            <TextInput 
              placeholder="Password" 
              placeholderTextColor="#9DA3B4" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry 
              style={styles.stylishInput} 
            />
          </View>
          
          <Text style={styles.stylishLabel}>Select Role:</Text>
          <View style={styles.stylishPickerContainer}>
            <Picker 
              selectedValue={role} 
              style={styles.stylishPicker} 
              onValueChange={(itemValue) => setRole(itemValue)}
            >
              <Picker.Item label="Admin" value="admin" />
              <Picker.Item label="Transactional" value="transactional" />
              <Picker.Item label="Viewonly" value="viewonly" />
            </Picker>
          </View>
          
          <TouchableOpacity 
            style={styles.stylishButton}
            onPress={handleRegister}
          >
            <Text style={styles.stylishButtonText}>Create Account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.stylishAltButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.stylishAltButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Login Screen
type LoginScreenProps = StackScreenProps<RootStackParamList, 'Login'>;
const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      setIsBiometricAvailable(available);
    } catch (error) {
      console.log('Biometric check failed:', error);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const { success, error } = await rnBiometrics.simplePrompt({
        promptMessage: 'Confirm your identity',
        cancelButtonText: 'Cancel'
      });

      if (success) {
        // Here you would typically retrieve stored credentials and attempt login
        // For demo purposes, we'll just show an alert
        Alert.alert('Success', 'Biometric authentication successful');
        // You should implement secure storage of credentials and use them here
      } else {
        Alert.alert('Error', 'Biometric authentication failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Biometric authentication error');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('http://192.168.1.7:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        if (isSuperadmin && data.role !== 'superadmin') {
          Alert.alert('Error', 'Not a superadmin account!');
          return;
        }
        navigation.replace('Main', { user: { username, password, role: data.role } });
      } else {
        Alert.alert('Login Failed', data.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.stylishBackground}>
      <View style={styles.loginOverlay}>
        <View style={styles.loginCard}>
          <View style={styles.loginHeaderContainer}>
            <Text style={styles.loginHeader}>Welcome</Text>
            <Text style={styles.loginSubheader}>Sign in to your account</Text>
          </View>
          
          <View style={styles.stylishInputContainer}>
            <Icon name="user" size={20} color="#4A6FFF" style={styles.stylishInputIcon} />
            <TextInput 
              placeholder="Username" 
              placeholderTextColor="#9DA3B4" 
              value={username} 
              onChangeText={setUsername} 
              style={styles.stylishInput} 
            />
          </View>
          
          <View style={styles.stylishInputContainer}>
            <Icon name="lock" size={20} color="#4A6FFF" style={styles.stylishInputIcon} />
            <TextInput 
              placeholder="Password" 
              placeholderTextColor="#9DA3B4" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry 
              style={styles.stylishInput} 
            />
          </View>
          
          <View style={styles.stylishSwitchContainer}>
            <Text style={styles.stylishLabel}>Superadmin Access</Text>
            <Switch 
              value={isSuperadmin} 
              onValueChange={setIsSuperadmin}
              trackColor={{ false: '#C4C9D9', true: '#D0D9FF' }}
              thumbColor={isSuperadmin ? '#4A6FFF' : '#F2F5FF'}
              ios_backgroundColor="#C4C9D9"
            />
          </View>
          
          {isSuperadmin && (
            <Text style={styles.stylishNotice}>
              Please use your superadmin credentials.
            </Text>
          )}
          
          <TouchableOpacity 
            style={styles.stylishButton}
            onPress={handleLogin}
          >
            <Text style={styles.stylishButtonText}>Sign In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.stylishAltButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.stylishAltButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Unlock Admin Screen
const UnlockScreen: React.FC = () => {
  const route = useRoute<MainRouteProp>();
  const { user } = route.params;
  const [adminUsername, setAdminUsername] = useState('');
  const [message, setMessage] = useState('');

  const handleUnlock = async () => {
    try {
      const response = await fetch('http://192.168.1.7:3001/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          superadminUsername: user.username,
          superadminPassword: user.password,
          adminUsername,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={[styles.stylishBackground, { backgroundColor: '#5C6BC0' }]}>
      <View style={styles.loginOverlay}>
        <View style={styles.loginCard}>
          <View style={styles.loginHeaderContainer}>
            <Icon name="unlock" size={40} color="#4A6FFF" style={{ marginBottom: 15 }} />
            <Text style={styles.loginHeader}>Unlock Account</Text>
            <Text style={styles.loginSubheader}>Enter username to unlock</Text>
          </View>
          
          <View style={styles.stylishInputContainer}>
            <Icon name="user" size={20} color="#4A6FFF" style={styles.stylishInputIcon} />
            <TextInput 
              placeholder="Username to Unlock" 
              placeholderTextColor="#9DA3B4" 
              value={adminUsername} 
              onChangeText={setAdminUsername} 
              style={styles.stylishInput} 
            />
          </View>
          
          {message ? (
            <View style={styles.messageContainer}>
              <Icon name="check-circle" size={20} color="#4CAF50" style={{ marginRight: 10 }} />
              <Text style={styles.successMessage}>{message}</Text>
            </View>
          ) : null}
          
          <TouchableOpacity 
            style={styles.stylishButton}
            onPress={handleUnlock}
          >
            <Text style={styles.stylishButtonText}>Unlock Account</Text>
          </TouchableOpacity>
          
          <View style={{ marginTop: 20 }}>
            <LogoutButton />
          </View>
        </View>
      </View>
    </View>
  );
};

// RoleChange Screen (User requesting role)
const RoleChangeScreen: React.FC = () => {
  const route = useRoute<MainRouteProp>();
  const { user } = route.params;
  const [requestedRole, setRequestedRole] = useState('');
  const [message, setMessage] = useState('');

  const handleRequest = async () => {
    try {
      const response = await fetch('http://192.168.1.7:3001/role-change-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, requestedRole }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={[styles.stylishBackground, { backgroundColor: '#3F51B5' }]}>
      <View style={styles.loginOverlay}>
        <View style={styles.loginCard}>
          <View style={styles.loginHeaderContainer}>
            <Icon name="exchange" size={40} color="#4A6FFF" style={{ marginBottom: 15 }} />
            <Text style={styles.loginHeader}>Role Change</Text>
            <Text style={styles.loginSubheader}>Request a different access level</Text>
          </View>
          
          <Text style={[styles.stylishLabel, { marginBottom: 10 }]}>Select New Role:</Text>
          <View style={styles.stylishPickerContainer}>
            <Picker 
              selectedValue={requestedRole} 
              style={styles.stylishPicker} 
              onValueChange={(itemValue) => setRequestedRole(itemValue)}
            >
              <Picker.Item label="Admin" value="admin" />
              <Picker.Item label="Transactional" value="transactional" />
              <Picker.Item label="Viewonly" value="viewonly" />
            </Picker>
          </View>
          
          {message ? (
            <View style={styles.messageContainer}>
              <Icon name="check-circle" size={20} color="#4CAF50" style={{ marginRight: 10 }} />
              <Text style={styles.successMessage}>{message}</Text>
            </View>
          ) : null}
          
          <TouchableOpacity 
            style={styles.stylishButton}
            onPress={handleRequest}
          >
            <Text style={styles.stylishButtonText}>Submit Request</Text>
          </TouchableOpacity>
          
          <View style={{ marginTop: 20 }}>
            <LogoutButton />
          </View>
        </View>
      </View>
    </View>
  );
};

// View Role Change Requests Screen
const ViewRoleChangeRequestsScreen: React.FC = () => {
  const route = useRoute<MainRouteProp>();
  const { user } = route.params;
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://192.168.1.7:3001/role-change-requests');
      const data = await response.json();
      if (response.ok) {
        setRequests(data.requests || []);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDecision = async (requestId: string, decision: 'accepted' | 'rejected') => {
    try {
      const response = await fetch(`http://192.168.1.7:3001/role-change-request/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          superadminUsername: user.username,
          superadminPassword: user.password,
          decision,
        }),
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        Alert.alert('Error', 'Server Error');
        return;
      }
      if (response.ok) {
        Alert.alert('Success', data.message);
        fetchRequests();
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (user.role !== 'superadmin') {
    return (
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.header}>Unauthorized Access</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.header}>Role Change Requests</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No role change requests found.</Text>
          </View>
        ) : (
          requests.map((req, index) => (
            <View key={index} style={styles.requestCard}>
              <Text style={styles.requestText}>
                <Text style={styles.boldText}>{req.userId?.username || 'Unknown User'}</Text> wants to become{' '}
                <Text style={styles.italicText}>{req.requestedRole}</Text>
              </Text>
              <View style={styles.buttonRow}>
                <CustomButton title="Accept" onPress={() => handleDecision(req._id, 'accepted')} />
                <View style={styles.buttonSpacer} />
                <CustomButton title="Reject" color="#FF5252" onPress={() => handleDecision(req._id, 'rejected')} />
              </View>
            </View>
          ))
        )}
        <LogoutButton />
      </View>
    </View>
  );
};

// Main Tabs with Icons
const MainTabs: React.FC = () => {
  const route = useRoute<MainRouteProp>();
  const { user } = route.params;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = '';

          if (route.name === 'Unlock') {
            iconName = 'unlock';
          } else if (route.name === 'ViewRequests') {
            iconName = 'eye';
          } else if (route.name === 'RoleChange') {
            iconName = 'exchange';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      {user.role === 'superadmin' ? (
        <>
          <Tab.Screen name="Unlock" component={UnlockScreen} initialParams={{ user }} />
          <Tab.Screen name="ViewRequests" component={ViewRoleChangeRequestsScreen} initialParams={{ user }} />
        </>
      ) : (
        <Tab.Screen name="RoleChange" component={RoleChangeScreen} initialParams={{ user }} />
      )}
    </Tab.Navigator>
  );
};

// Separate AppLock component outside the main App
const AppLockScreen = ({ onAuthenticate }) => {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  useEffect(() => {
    checkBiometrics();
  }, []);
  
  const checkBiometrics = async () => {
    try {
      console.log('Checking biometric availability...');
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      console.log('Biometric available:', available, biometryType);
      
      setIsBiometricAvailable(available);
      
      if (available) {
        // Auto-trigger authentication after a short delay
        setTimeout(() => {
          authenticateWithBiometrics();
        }, 1000);
      }
    } catch (error) {
      console.error('Biometric check error:', error);
      Alert.alert('Error', 'Failed to check biometric availability');
    }
  };
  
  const authenticateWithBiometrics = async () => {
    try {
      console.log('Starting authentication...');
      setIsAuthenticating(true);
      
      const result = await rnBiometrics.simplePrompt({
        promptMessage: 'Unlock App',
        cancelButtonText: 'Cancel',
        allowDeviceCredentials: true
      });
      
      console.log('Auth result:', result);
      
      if (result && result.success) {
        console.log('Auth success, will navigate to Login');
        
        // Show success message
        Alert.alert(
          'Success!', 
          'Authentication successful!', 
          [
            { 
              text: 'Continue', 
              onPress: () => {
                // Call the callback to change screens
                onAuthenticate();
              }
            }
          ]
        );
      } else {
        setIsAuthenticating(false);
        Alert.alert('Failed', 'Authentication failed or cancelled');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setIsAuthenticating(false);
      Alert.alert('Error', 'Authentication error');
    }
  };
  
  // Emergency bypass button
  const bypass = () => {
    console.log('Emergency bypass');
    onAuthenticate();
  };
  
  return (
    <View style={[styles.backgroundContainer, { backgroundColor: '#0D47A1' }]}>
      <View style={styles.container}>
        <View style={[styles.formContainer, { backgroundColor: 'rgba(150, 150, 255, 0.2)', borderColor: 'rgba(200, 200, 255, 0.4)' }]}>
          <Text style={[styles.header, { color: '#FFF' }]}>App</Text>
          
          {isAuthenticating ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(100, 100, 255, 0.25)', borderColor: 'rgba(150, 150, 255, 0.5)' }]}>
                <Icon name="lock" size={80} color="#FFFFFF" />
              </View>
              
              {isBiometricAvailable ? (
                <TouchableOpacity 
                  style={[styles.button, {backgroundColor: '#2196F3'}]}
                  onPress={authenticateWithBiometrics}
                >
                  <Text style={styles.buttonText}>Authenticate with Fingerprint</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.errorText}>
                  Biometric authentication not available
                </Text>
              )}
              
              <TouchableOpacity 
                style={[styles.button, {backgroundColor: '#1565C0', marginTop: 20}]}
                onPress={bypass}
              >
                <Text style={styles.buttonText}>Emergency Bypass</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

// SIMPLIFIED APP COMPONENT
const App: React.FC = () => {
  // Simple single state to control which screen is shown
  const [currentScreen, setCurrentScreen] = useState('AppLock');
  
  console.log('App rendering, current screen:', currentScreen);
  
  // Callback for authentication
  const handleAuthentication = () => {
    console.log('Setting screen to Login');
    setCurrentScreen('Login');
  };
  
  // Navigation mock for screens
  const navigation = {
    navigate: (screen, params) => {
      console.log(`Navigating to ${screen}`);
      setCurrentScreen(screen);
    },
    replace: (screen, params) => {
      console.log(`Replacing with ${screen}`);
      setCurrentScreen(screen);
    }
  };

  // Render based on current screen
  if (currentScreen === 'AppLock') {
    return (
      <GestureHandlerRootView style={{flex: 1}}>
        <AppLockScreen onAuthenticate={handleAuthentication} />
      </GestureHandlerRootView>
    );
  } else if (currentScreen === 'Login') {
    return (
      <GestureHandlerRootView style={{flex: 1}}>
        <LoginScreen navigation={navigation} />
      </GestureHandlerRootView>
    );
  } else if (currentScreen === 'Register') {
    return (
      <GestureHandlerRootView style={{flex: 1}}>
        <RegistrationScreen navigation={navigation} />
      </GestureHandlerRootView>
    );
  } else if (currentScreen === 'Main') {
    return (
      <GestureHandlerRootView style={{flex: 1}}>
        <MainTabs />
      </GestureHandlerRootView>
    );
  }
  
  // Fallback
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AppLockScreen onAuthenticate={handleAuthentication} />
    </GestureHandlerRootView>
  );
};

// Add these styles (keep all existing styles too)
const extraStyles = {
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#B3E5FC',
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  }
};

// Add these styles for the stylish login screen
const loginStyles = {
  stylishBackground: {
    flex: 1,
    backgroundColor: '#3949AB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginOverlay: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(66, 66, 155, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  loginHeaderContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  loginHeader: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  loginSubheader: {
    fontSize: 16,
    color: '#666',
  },
  stylishInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F7F9FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    shadowColor: '#8A97FF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1,
  },
  stylishInputIcon: {
    padding: 12,
  },
  stylishInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  stylishSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  stylishLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  stylishNotice: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#FF6B6B',
    fontWeight: '500',
    fontSize: 14,
  },
  stylishButton: {
    backgroundColor: '#4A6FFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#8A97FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  stylishButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stylishAltButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A6FFF',
  },
  stylishAltButtonText: {
    color: '#4A6FFF',
    fontSize: 16,
    fontWeight: '600',
  },
};

// Add these additional styles
const moreStyles = {
  stylishPickerContainer: {
    backgroundColor: '#F7F9FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    marginBottom: 25,
    overflow: 'hidden',
    elevation: 1,
  },
  stylishPicker: {
    height: 50,
    width: '100%',
    color: '#444',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  successMessage: {
    color: '#4CAF50',
    fontSize: 14,
    flex: 1,
  },
};

// Merge with existing styles
const styles = StyleSheet.create({
  ...StyleSheet.flatten(extraStyles),
  ...StyleSheet.flatten(loginStyles),
  ...StyleSheet.flatten(moreStyles),
  backgroundContainer: {
    flex: 1,
    backgroundColor: '#1a237e',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  formContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    margin: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
    padding: 20,
    marginBottom: 20,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  lockIcon: {
    alignSelf: 'center',
  },
  lockText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  customButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  customButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#2D3142',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  picker: {
    height: 50,
    color: '#2D3142',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#2D3142',
    fontWeight: '600',
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    color: '#6B4EFF',
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  notice: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#FF6B6B',
    fontWeight: '600',
    fontSize: 14,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  requestText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  italicText: {
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonSpacer: {
    width: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default App;
