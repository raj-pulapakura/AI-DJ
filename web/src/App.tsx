import { useEffect, useState } from 'react'
import SpotifyLoginButton from './components/SpotifyLoginButton'
import axios from 'axios'
import { ClipLoader } from 'react-spinners';
import DashboardPage from './pages/dashboard/DashboardPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true);
  const [tryAuth, setTryAuth] = useState(false);

  // Add access token to all requests
  useEffect(() => {
    axios.interceptors.request.use(
      async config => {
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        // Change the base URL to the VITE API_URL
        config.baseURL = import.meta.env.VITE_API_URL
        return config
      },
      error => {
        return Promise.reject(error)
      }
    )
  }, []);

  useEffect(() => {
    // Check if the user is authenticated
    const token = localStorage.getItem('access_token')

    // Send server request to check if the token is valid
    if (token) {
      axios.get('/api/me')
        .then(() => {
          setIsAuthenticated(true);
          setAuthLoading(false);
        })
        .catch(() => {
          setIsAuthenticated(false);
          setAuthLoading(false);
        })
    } else {
      setIsAuthenticated(false);
      setAuthLoading(false);
    }
  }, [tryAuth]);


  useEffect(() => {
    if (!isAuthenticated) {
      const body = {
        refresh_token: localStorage.getItem('refresh_token')
      }

      axios.post('/auth/refresh-token', body)
        .then((response) => {
          const { access_token, refresh_token } = response.data;
          localStorage.setItem('access_token', access_token);
          if (refresh_token) {
            localStorage.setItem('refresh_token', refresh_token);
          }
          setTryAuth(!tryAuth);
        }).catch((error) => {
          console.log(error)
        })
    }
  },
    [isAuthenticated]);


  if (authLoading) {
    return <div>
      <ClipLoader />
      <h1>Loading...</h1>
    </div>
  }

  return isAuthenticated ? <>
    <DashboardPage />
  </> : <>
    <SpotifyLoginButton />
  </>
}

export default App
