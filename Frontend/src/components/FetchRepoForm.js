import React, { useState } from "react";
import axios from "axios";

const FetchRepoForm = () => {
const [username, setUsername] = useState("");
const [repository, setRepository] = useState("");
const [responseMessage, setResponseMessage] = useState("");
const [vmIP, setVmIP] = useState(""); 

const handleSubmit = async (e) => {
    e.preventDefault();

    setResponseMessage("Creating VM... Booting up VM... Fetching VM IP...");
    
    try {
        const response = await axios.post("http://localhost:5000/createvm", {
            username,
            repository,
        });
        console.log("Frontend: ",response);
        
        if (response.data.vmIP) {
            setVmIP(response.data.vmIP); // Store the VM IP
            setResponseMessage(`VM Created! IP Address: ${response.data.vmIP}`);
        } else {
            setResponseMessage('Failed to create VM.');
        }
    } catch (error) {
        console.error('Error during VM creation:', error.message);
        setResponseMessage('Creating VM... Booting up VM... Fetching VM IP...');
    }
};

  return (
    <div style={styles.container}>
      <h1>Fetch GitHub Repository</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label>GitHub Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div style={styles.inputGroup}>
          <label>Repository Name:</label>
          <input
            type="text"
            value={repository}
            onChange={(e) => setRepository(e.target.value)}
            required
          />
        </div>
        <button type="submit" style={styles.button}>
          Fetch Repository
        </button>
      </form>
      {responseMessage && <p style={styles.message}>{responseMessage}</p>}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },
  button: {
    padding: "10px",
    fontSize: "16px",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
  },
  message: {
    marginTop: "20px",
    color: "green",
  },
};

export default FetchRepoForm;
