import React, { createContext, useState, useContext, useEffect } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Check if user is logged in on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    const signup = async (email, password, fullName) => {
        try {
            setError(null)
            const response = await authApi.signup({
                email,
                password,
                full_name: fullName
            })
            const userData = {
                id: response.data.user_id,
                email,
                full_name: fullName
            }
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
            return response.data
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Signup failed'
            setError(errorMsg)
            throw err
        }
    }

    const login = async (email, password) => {
        try {
            setError(null)
            const response = await authApi.login({ email, password })
            const userData = response.data.user
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
            return response.data
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Login failed'
            setError(errorMsg)
            throw err
        }
    }

    const logout = async () => {
        try {
            await authApi.logout()
        } catch (err) {
            console.error('Logout error:', err)
        } finally {
            setUser(null)
            localStorage.removeItem('user')
        }
    }

    const value = {
        user,
        loading,
        error,
        signup,
        login,
        logout,
        isAuthenticated: !!user
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
