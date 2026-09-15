import axios from "axios";

const API = axios.create({
    baseURL: "https://e-commerc.onrender.com", // replace with your actual Render URL
});

export default API;