import axios from "axios";

const API = "http://127.0.0.1:8000/api";

export const getTrafficData = () => axios.get(`${API}/traffic/`);
export const getPrediction = () => axios.get(`${API}/prediction/`);
export const getIncidents = () => axios.get(`${API}/nlp/`);