import express from "express"
import axios from "axios"
import {exec} from "child_process"
import cors from "cors"
import { Client } from 'ssh2';
import { readFileSync } from 'fs';  
import simpleGit from 'simple-git';
import path from "path";
import os from "os"

const app = express();
app.use(cors());

app.use(express.json());

const PORT = 5000;

// Endpoint to create VM
app.get("/",async(req,res)=>{
    res.send("NodeJS Server up and running")
});

app.post('/createvm', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:8080/createvm', {
            userName: req.body.username,
            repoName: req.body.repository,
        });

        console.log("Response:",response.data);
        if (response.data) {
            res.status(200).json({ vmIP: response.data });
        } else {
            res.status(500).json({ error: 'VM creation failed or no IP returned' });
        }
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

app.get('/clone-repo/:githubUsername/:repoName/:vmUsername/:vmIP', (req, res) => {
    const ssh = new Client();
    const { githubUsername, repoName, vmUsername, vmIP } = req.params;

    if (!githubUsername || !repoName || !vmUsername || !vmIP) {
        return res.status(400).send('Missing required fields in URL parameters');
    }

    const sshKeyPath = path.join(os.homedir(), '.ssh', 'id_rsa');
    const repoUrl = `https://github.com/${githubUsername}/${repoName}.git`;
    const cloneCommand = `git clone ${repoUrl} ~/Desktop/${repoName}`;  

    ssh.on('ready', () => {
        console.log('SSH connection established');

        const logCurrentDirCommand = 'pwd';
        
        ssh.exec(logCurrentDirCommand, (err, stream) => {
            if (err) {
                console.error('Error executing pwd:', err);
                ssh.end();
                return res.status(500).send('Error logging current directory');
            }

            stream.on('close', (code, signal) => {
                if (code === 0) {
                    console.log('Current directory logged successfully');
                    
                    // Now execute the git clone command
                    ssh.exec(cloneCommand, (err, stream) => {
                        if (err) {
                            console.error('Error executing git clone:', err);
                            ssh.end();
                            return res.status(500).send('Error executing git clone');
                        }

                        stream.on('close', (code, signal) => {
                            if (code === 0) {
                                console.log('Repository cloned successfully');
                                ssh.end();  // Ensure session is closed after cloning
                                return res.send('Repository cloned successfully to Desktop');
                            } else {
                                console.error('Error cloning repository');
                                ssh.end();
                                return res.status(500).send('Error cloning repository');
                            }
                        }).on('data', (data) => {
                            console.log('stdout: ' + data);
                        }).stderr.on('data', (data) => {
                            console.error('stderr: ' + data);
                        });
                    });
                } else {
                    console.error('Error logging current directory');
                    ssh.end();
                    return res.status(500).send('Error logging current directory');
                }
            }).on('data', (data) => {
                console.log('Current directory: ' + data.toString().trim());
            }).stderr.on('data', (data) => {
                console.error('stderr: ' + data);
            });
        });
    }).on('error', (err) => {
        console.error('SSH connection error:', err);
        ssh.end();  // Ensure session is closed on error
        res.status(500).send('SSH connection error');
    }).connect({
        host: `192.168.122.${vmIP}`,
        port: 22,
        username: vmUsername,
        privateKey: readFileSync(sshKeyPath),  // Use the private key
    });
});


app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
