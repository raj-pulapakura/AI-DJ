import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';

export default function AuthPage() {
    const [params] = useSearchParams();

    useEffect(() => {
        const access_token = params.get('access_token')
        const refresh_token = params.get('refresh_token')

        if (access_token && refresh_token) {
            localStorage.setItem('access_token', access_token)
            localStorage.setItem('refresh_token', refresh_token)

            window.location.href = '/'
        }
    }, [params])

    return (
        <div>
            <h1>Loading...</h1>
            <ClipLoader
                loading={true}
                size={150}
                aria-label="Loading Spinner"
                data-testid="loader"
            />
        </div>
    )
}
