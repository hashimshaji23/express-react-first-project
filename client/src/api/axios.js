import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://e-commerc-irrt.onrender.com",
});

export default API;
