import axios from 'axios';

const baseUrl = 'https://vemcount.app/api/v3';

// Passing configuration object to axios
export async function login(username, password) {
    return await axios.post(`${baseUrl}/auth/login/`, {
        user_name: username,
        password: password,
    }).then((response) => {
        return response.data
    }).catch(e => {
        return new Error('Username and password does not match')
    })
}

export function logout(token) {
    axios.post(`${baseUrl}/auth/logout/`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    ).then(response => {
        console.log(response.data)
    }).catch(e => {
        console.log(e)
    })
}

