const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.json());

// bKash API credentials (replace with your actual credentials)
const bkashConfig = {
  baseURL: 'https://checkout.sandbox.bkash.com/v1.2.0-beta', // Sandbox URL
  appKey: 'your_bkash_app_key',
  appSecret: 'your_bkash_app_secret',
  username: 'your_bkash_username',
  password: 'your_bkash_password',
};

// Rocket API credentials (replace with your actual credentials)
const rocketConfig = {
  baseURL: 'https://api.rocket.com/v1', // Replace with actual Rocket API URL
  apiKey: 'your_rocket_api_key',
};

// bKash: Create Payment
app.post('/bkash/create-payment', async (req, res) => {
  try {
    const { amount, userId } = req.body;

    const response = await axios.post(
      `${bkashConfig.baseURL}/checkout/payment/create`,
      {
        amount,
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: `INV${Date.now()}`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${bkashConfig.username}:${bkashConfig.password}`).toString('base64')}`,
          'X-APP-Key': bkashConfig.appKey,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rocket: Create Payment (mocked, as Rocket API details may vary)
app.post('/rocket/create-payment', async (req, res) => {
  try {
    const { amount, userId } = req.body;

    const response = await axios.post(
      `${rocketConfig.baseURL}/payment/create`,
      {
        amount,
        currency: 'BDT',
        userId,
      },
      {
        headers: {
          'Authorization': `Bearer ${rocketConfig.apiKey}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});