import express from "express"
import axios from "axios"
import {exec} from "child_process"
import cors from "cors"
import { log } from "console";

const app = express();
app.use(cors({origin: ["http://localhost:3000"], credentials: true}));

app.use(express.json());

const PORT = 5000;

// Endpoint to create VM
app.get("/",async(req,res)=>{
    res.send("NodeJS Server up and running")
});

app.post('/createvm', async (req, res) => {
    try {
        console.log(req.body);
        const response = await axios.post('http://localhost:8080/createvm', {
            userName: req.body.username,
            repoName: req.body.repository,
            // timestamp: req.body.timestamp
        });
        res.status(200).json({ message: response.data });
    } catch (error) {
        console.error('Error creating VM:', error.message);
        res.status(500).json({ error: 'Failed to create VM' });
    }
});

app.get('/list-vms', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:8080/list-vms');
        res.status(200).json({ vms: response.data });
    } catch (error) {
        console.error('Error listing VMs:', error.message);
        res.status(500).json({ error: 'Failed to list VMs' });
    }
});

app.post('/transfer-files', (req, res) => {
    const { filePath, vmAddress, remotePath } = req.body;

    if (!filePath || !vmAddress || !remotePath) {
        return res.status(400).json({ error: 'Missing file transfer parameters' });
    }

    const scpCommand = `scp -r ${filePath} user@${vmAddress}:${remotePath}`;
    exec(scpCommand, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error transferring files: ${stderr}`);
            return res.status(500).json({ error: 'File transfer failed' });
        }
        res.status(200).json({ message: 'Files transferred successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
