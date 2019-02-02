import axios from 'axios';

export const HTTP = axios.create({
  baseURL: `http://localhost:3000/api/`,
  headers: {
    Authorization: 'Bearer ' + window.localStorage.getItem('token')
  }
})
