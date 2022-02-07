//AuthContext.js
import React, {createContext, useState} from 'react';
import { login, logout } from './api.js'
import * as SecureStore from 'expo-secure-store'
import * as LocalAuthentication from "expo-local-authentication";

const AuthContext = createContext(null);
const {Provider} = AuthContext;

const AuthProvider = ({children}) => {
    const [authState, setAuthState] = useState({
        accessToken: null,
        authenticated: false,
    });

    const [errorMsg, setErrorMsg] = useState(null)

    const setLogout = async () => {
        logout(getAccessToken())
        setAuthState({
            accessToken: null,
            authenticated: false,
        });
    };

    const getAccessToken = () => {
        return authState.accessToken;
    };

    const setLogin = async (username, password) => {
        const result = await login(username, password)
        if(result.access_token) {
            setAuthState({
                accessToken: result.access_token,
                authenticated: true,
            })

            try {
                const jsonLogin = JSON.stringify({
                    user_name: username,
                    password: password,
                    accessToken: result.access_token
                })
                await SecureStore.setItemAsync('user_info', jsonLogin)
            } catch(e) {
                setErrorMsg('Error while getting your information')
            }

        } else {
            setErrorMsg(result.message)
        }
    }

    const getStoredUser = async () => {
        try {
            const jsonValue = await SecureStore.getItemAsync('user_info')
            return jsonValue != null ? JSON.parse(jsonValue) : null
        } catch(e) {
            // read error
            setErrorMsg('Your info was compromised, too bad')
        }
    }

    const getBioAuth = async (username, password) => {
        const compatible = await LocalAuthentication.hasHardwareAsync()
        if (!compatible) {
            throw 'This device is not compatible for biometric authentication'
        }

        const enrolled = await LocalAuthentication.isEnrolledAsync()
        if (!enrolled) {
            throw 'This device doesnt have biometric authentication enabled'
        }

        const result = await LocalAuthentication.authenticateAsync()
        if (!result.success) {
            throw `${result.error} - Authentication unsuccessful`
        }

        if(result.success) {
            const user = await getStoredUser()
            if(user) {
                await setLogin(user.user_name, user.password)
            } else {
                setErrorMsg('No touch id')
            }
        }
    }


    return (
        <Provider
            value={{
                getAccessToken,
                getStoredUser,
                getBioAuth,
                setLogout,
                setLogin,
                authState,
                setAuthState,
                errorMsg,
            }}>
            {children}
        </Provider>
    );
};

export { AuthContext, AuthProvider };