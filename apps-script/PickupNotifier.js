/**
 * Google Apps Script for Keep.ID ID Pickup Form Submission
 * Triggers on form submit and sends SMS notification via Windmill webhook
 */

/**
 * Main function triggered on form submission
 */
function onFormSubmit(e) {
  try {
    // Extract values from form submission
    // Column order: Timestamp, Worker Name, Client Name, Client Phone Number,
    // Client Email Address, ID to Pickup, Pickup Street Address, Pickup State,
    // Pickup City, Pickup ZIP Code, Pickup Hours
    const values = e.namedValues;

    const workerName = values['Worker Name'][0];
    const clientName = values['Client Name'][0];
    const clientPhoneRaw = values['Client Phone Number'][0];
    const clientEmail = values['Client Email Address'][0];
    const idToPickup = values['ID to Pickup'][0];
    const streetAddress = values['Pickup Street Address'][0];
    const city = values['Pickup City'][0];
    const state = values['Pickup State (abbreviation)'][0];
    const zipCode = values['Pickup ZIP Code'][0];
    const pickupHours = values['Pickup Hours'][0];

    // Normalize phone number to +11234567890 format
    const clientPhone = normalizePhoneNumber(clientPhoneRaw);

    // Build location string from address components
    const location = buildLocationString(streetAddress, city, state, zipCode);

    // Build message body
    const message = `Hi ${clientName}, your ${idToPickup} is ready for pickup at ${location}. Pickup hours: ${pickupHours}. Your case worker ${workerName} is ready to help with further ID needs.`;

    // Get script properties
    const scriptProperties = PropertiesService.getScriptProperties();
    const accountSid = scriptProperties.getProperty('ACCOUNT_SID');
    const authToken = scriptProperties.getProperty('AUTH_TOKEN_TWILIO');
    const fromPhone = scriptProperties.getProperty('TWILIO_PHONE_NUMBER');
    const windmillToken = scriptProperties.getProperty('WINDMILL_API_TOKEN');
    const windmillUrl = scriptProperties.getProperty('WINDMILL_URL');

    // Validate all required properties are set
    if (!accountSid || !authToken || !fromPhone || !windmillToken) {
      throw new Error('Missing required script properties. Please set ACCOUNT_SID, AUTH_TOKEN_TWILIO, TWILIO_PHONE_NUMBER, and WINDMILL_API_TOKEN.');
    }

    // Call Windmill webhook
    const result = triggerWindmillJob(message, clientPhone, fromPhone, accountSid, authToken, windmillToken, windmillUrl);

    Logger.log('Form submission processed successfully');
    Logger.log('Client: ' + clientName);
    Logger.log('Phone: ' + clientPhone);
    Logger.log('Windmill response: ' + result);

  } catch (error) {
    Logger.log('Error processing form submission: ' + error.message);
    Logger.log(error.stack);
    // Optionally: send error notification to admin
    throw error;
  }
}

/**
 * Normalize phone number to +11234567890 format
 * Handles formats: (123) 456-7890, 123-456-7890, 1234567890, +1 123 456 7890, etc.
 * @param {string} phoneNumber - Raw phone number from form
 * @returns {string} Normalized phone number in format +11234567890
 */
function normalizePhoneNumber(phoneNumber) {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');

  // Handle different cases:
  // If 10 digits: prepend +1
  // If 11 digits starting with 1: prepend +
  // If already has country code: use as is

  if (digitsOnly.length === 10) {
    return '+1' + digitsOnly;
  } else if (digitsOnly.length === 11 && digitsOnly.charAt(0) === '1') {
    return '+' + digitsOnly;
  } else if (digitsOnly.length === 11) {
    // Assume it needs +1 prefix
    return '+1' + digitsOnly;
  } else {
    // Return with + if not already present
    return phoneNumber.startsWith('+') ? phoneNumber : '+' + digitsOnly;
  }
}

/**
 * Build location string from address components
 */
function buildLocationString(street, city, state, zipCode) {
  return `${street}, ${city}, ${state} ${zipCode}`;
}

/**
 * Trigger Windmill job via webhook
 */
function triggerWindmillJob(message, toPhone, fromPhone, accountSid, authToken, windmillToken, windmillUrl) {

  const payload = {
    method: 'sms',
    message: message,
    sms_config: {
      twilio_auth: {
        accountSid: accountSid,
        token: authToken
      },
      to_phone_number: toPhone,
      from_phone_number: fromPhone
    },
    email_config: {
      subject: ''
    }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + windmillToken
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(windmillUrl, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode === 200 || responseCode === 201) {
      Logger.log('Windmill job triggered successfully. UUID: ' + responseText);
      return responseText;
    } else {
      throw new Error('Windmill API error. Status: ' + responseCode + ', Response: ' + responseText);
    }
  } catch (error) {
    Logger.log('Error calling Windmill webhook: ' + error.message);
    throw error;
  }
}

/**
 * Test function
 */
function testFormSubmit() {
  const testEvent = {
    namedValues: {
      'Worker Name': ['John Doe'],
      'Client Name': ['Jane Smith'],
      'Client Phone Number': ['(555) 123-4567'],
      'Client Email Address': ['jane.smith@example.com'],
      'ID to Pickup': ['Driver License'],
      'Pickup Street Address': ['123 Main Street'],
      'Pickup City': ['Philadelphia'],
      'Pickup State': ['PA'],
      'Pickup ZIP Code': ['19104'],
      'Pickup Hours': ['Mon-Fri 9AM-5PM']
    }
  };

  onFormSubmit(testEvent);
}
