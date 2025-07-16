// screens/AgentScreen.tsx
import { StyleSheet, Text, View } from 'react-native';

const AgentScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agent Dashboard</Text>
      <View style={styles.agentInfo}>
        <Text>Agent Information will be displayed here</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  agentInfo: {
    width: '100%',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default AgentScreen;
