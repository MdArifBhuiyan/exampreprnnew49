import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';

const PaymentScreen = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const plans = [
    { id: '1', name: 'Basic', price: 5 },
    { id: '2', name: 'Premium', price: 10 },
  ];

  const paymentMethods = [
    { id: '1', name: 'bKash' },
    { id: '2', name: 'Rocket' },
  ];

  const confirmPayment = async () => {
    if (!selectedPlan || !selectedMethod) {
      Alert.alert('Error', 'Please select a plan and payment method.');
      return;
    }

    try {
      // Replace with actual payment API call
      const response = await fetch('http://10.0.2.2:3000/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          method: selectedMethod,
        }),
      });
      const result = await response.json();
      Alert.alert('Success', 'Payment confirmed!');
    } catch (error) {
      Alert.alert('Error', 'Payment failed. Please try again.');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#121212' }}>
      <Text style={{ color: '#fff', fontSize: 20, marginBottom: 10 }}>Select a Plan</Text>
      {plans.map((plan) => (
        <TouchableOpacity
          key={plan.id}
          style={{
            backgroundColor: selectedPlan === plan.id ? '#333' : '#555',
            padding: 10,
            marginVertical: 5,
            borderRadius: 5,
          }}
          onPress={() => setSelectedPlan(plan.id)}
        >
          <Text style={{ color: '#fff' }}>{`${plan.name} - $${plan.price}`}</Text>
        </TouchableOpacity>
      ))}

      <Text style={{ color: '#fff', fontSize: 20, marginTop: 20, marginBottom: 10 }}>
        Select Payment Method
      </Text>
      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={{
            backgroundColor: selectedMethod === method.id ? '#333' : '#555',
            padding: 10,
            marginVertical: 5,
            borderRadius: 5,
          }}
          onPress={() => setSelectedMethod(method.id)}
        >
          <Text style={{ color: '#fff' }}>{method.name}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={{
          backgroundColor: '#080',
          padding: 15,
          marginTop: 20,
          borderRadius: 5,
          alignItems: 'center',
        }}
        onPress={confirmPayment}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>Confirm Payment</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PaymentScreen;