const fs = require('fs');

// Read input text file
const inputText = fs.readFileSync('input.txt', 'utf8');

// Regular expression to match email addresses
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Extract all email addresses
const emails = inputText.match(emailRegex);

// Filter out duplicates and null values
const uniqueEmails = [...new Set(emails)].filter(Boolean);

// Write emails to output file
fs.writeFileSync('extracted_emails.txt', uniqueEmails.join('\n'));

console.log(`Found ${uniqueEmails.length} unique email addresses`);
console.log('Emails have been saved to extracted_emails.txt');
