const plivo = require('plivo');

// Initialize Plivo client
const client = new plivo.RestClient(
  process.env.PLIVO_AUTH_ID,
  process.env.PLIVO_AUTH_TOKEN
);

async function sendTestSMS() {
  try {
    console.log('Sending test SMS to +17705970345...');
    console.log('Auth ID:', process.env.PLIVO_AUTH_ID ? '✓ Set' : '✗ Missing');
    console.log('Auth Token:', process.env.PLIVO_AUTH_TOKEN ? '✓ Set' : '✗ Missing');
    console.log('Sender ID:', process.env.PLIVO_SENDER_ID || 'Glamorybee');

    const response = await client.messages.create(
      process.env.PLIVO_SENDER_ID || 'Glamorybee',
      ['+17705970345'],
      'Hello! This is a test SMS from Glamorybee. If you receive this, SMS notifications are working!'
    );

    console.log('\n✓ SMS sent successfully!');
    console.log('Message UUID:', response.messageUuid);
  } catch (error) {
    console.error('\n✗ Error sending SMS:');
    console.error('Status:', error.status);
    console.error('Message:', error.message);
    console.error('Body:', error.body);
  }
}

sendTestSMS();
