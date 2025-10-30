// Quick network test - run this to verify connection
const API_URL = 'http://192.168.88.55:5001/api/usda/search?query=apple';

fetch(API_URL)
  .then(response => response.json())
  .then(data => {
    console.log('✅ Network test SUCCESSFUL!');
    console.log('Data:', JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.error('❌ Network test FAILED!');
    console.error('Error:', error.message);
    console.error('Full error:', error);
  });
