// Simple network connectivity test
const axios = require("axios");

async function testConnectivity() {
  console.log("Testing connectivity to n8n...\n");

  const endpoints = [
    "http://localhost:5678/healthz",
    "http://127.0.0.1:5678/healthz",
    "http://host.docker.internal:5678/healthz",
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint}`);
      const response = await axios.get(endpoint, { timeout: 5000 });
      console.log(`✅ SUCCESS: ${endpoint} - Status: ${response.status}\n`);
    } catch (error) {
      console.log(`❌ FAILED: ${endpoint} - Error: ${error.message}\n`);
    }
  }

  // Test webhook endpoints
  const webhookEndpoints = [
    "http://localhost:5678/webhook/generate-interview-questions",
    "http://localhost:5678/webhook/generate-feedback",
  ];

  console.log("Testing webhook endpoints...\n");

  for (const endpoint of webhookEndpoints) {
    try {
      console.log(`Testing: ${endpoint}`);
      const response = await axios.post(
        endpoint,
        { test: "connectivity" },
        { timeout: 5000 }
      );
      console.log(
        `✅ WEBHOOK SUCCESS: ${endpoint} - Status: ${response.status}\n`
      );
    } catch (error) {
      if (error.response) {
        console.log(
          `📡 WEBHOOK RESPONDING: ${endpoint} - Status: ${error.response.status} (This is expected if webhook logic rejects test data)\n`
        );
      } else {
        console.log(
          `❌ WEBHOOK FAILED: ${endpoint} - Error: ${error.message}\n`
        );
      }
    }
  }
}

testConnectivity().catch(console.error);
