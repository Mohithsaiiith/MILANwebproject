const fs = require('fs');
const path = require('path');
const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Load credentials
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');
const SPREADSHEET_ID = 'your-spreadsheet-id';
const SHEET_NAME = 'Sheet1';

// Authenticate and authorize
const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

async function authorize() {
    const authClient = await auth.getClient();
    return authClient;
}

// Create Operation
app.post('/create', async (req, res) => {
    try {
        const authClient = await authorize();
        const values = [
            [req.body.column1, req.body.column2, req.body.column3] // Modify according to your sheet's structure
        ];
        const resource = {
            values,
        };
        const result = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: SHEET_NAME,
            valueInputOption: 'RAW',
            resource,
            auth: authClient,
        });
        res.status(201).json(result.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Read Operation
app.get('/read', async (req, res) => {
    try {
        const authClient = await authorize();
        const result = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: SHEET_NAME,
            auth: authClient,
        });
        res.status(200).json(result.data.values);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Operation
app.put('/update', async (req, res) => {
    try {
        const authClient = await authorize();
        const rowNumber = req.body.rowNumber; // Assuming rowNumber is provided
        const values = [
            [req.body.column1, req.body.column2, req.body.column3] // Modify according to your sheet's structure
        ];
        const resource = {
            values,
        };
        const range = `${SHEET_NAME}!A${rowNumber}`; // Assuming you are updating the entire row
        const result = await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range,
            valueInputOption: 'RAW',
            resource,
            auth: authClient,
        });
        res.status(200).json(result.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Operation
app.delete('/delete', async (req, res) => {
    try {
        const authClient = await authorize();
        const rowNumber = req.body.rowNumber; // Assuming rowNumber is provided
        const range = `${SHEET_NAME}!A${rowNumber}:Z${rowNumber}`; // Adjust the range as per your sheet's structure
        const result = await sheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID,
            range,
            auth: authClient,
        });
        res.status(200).json(result.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
