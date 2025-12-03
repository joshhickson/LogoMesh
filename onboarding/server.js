const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Define the absolute path to the onboarding directory
const onboardingDir = __dirname;
const projectRoot = path.join(__dirname, '..');

// Serve static files (HTML, CSS, JS, JSON) from the onboarding directory
app.use(express.static(onboardingDir));

// Serve the 'docs' directory so files can be accessed/linked
app.use('/docs', express.static(path.join(projectRoot, 'docs')));

// Optional: A simple API endpoint to confirm the server is running
app.get('/api/status', (req, res) => {
    res.json({ status: 'Onboarding server is running' });
});

// All other routes should serve the index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(onboardingDir, 'index.html'));
});

app.listen(port, () => {
    console.log(`Onboarding server listening at http://localhost:${port}`);
    console.log(`Serving files from: ${onboardingDir}`);
    console.log('Press Ctrl+C to stop the server.');
});
