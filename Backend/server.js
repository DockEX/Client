const express = require('express');
const axios = require('axios');
const cors = require('cors');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

app.post('/api/fetch-repo', async (req, res) => {
    const { username, repository, targetPath } = req.body;

    if (!username || !repository || !targetPath) {
        return res.status(400).json({ error: 'Username, repository name, and target path are required' });
    }

    const repoUrl = `https://github.com/${username}/${repository}.git`;
    const targetDirectory = path.resolve(targetPath);

    // Ensure the target directory exists
    try {
        if (!fs.existsSync(targetDirectory)) {
            fs.mkdirSync(targetDirectory, { recursive: true });
        }

        // Clone the repository using simple-git
        const git = simpleGit();
        await git.clone(repoUrl, targetDirectory);

        res.status(200).json({ message: `Repository cloned successfully to ${targetDirectory}` });
    } catch (error) {
        console.error('Error cloning repository:', error.message);
        res.status(500).json({ error: 'Failed to clone the repository. Check the provided details and permissions.' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
