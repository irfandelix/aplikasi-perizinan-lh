import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import clipboardIcon from '../clipboard.png'; // Pastikan path ini benar

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/login', { username, password });
            if (response.data.success) {
                localStorage.setItem('userRole', response.data.role);
                navigate('/dashboard');
            }
        } catch (err) {
            setError('Username atau password salah.');
        }
    };

    return (
        // Menggunakan wrapper dengan latar belakang gradien
        <div className="modern-login-wrapper"> 
            {/* Menggunakan kartu login baru */}
            <div className="login-card"> 

                {/* Ikon di bagian atas */}
                <div className="login-icon-wrapper">
                    <img src={clipboardIcon} alt="Logo Checklist" className="login-icon" />
                </div>

                <h2>Login Aplikasi</h2>
                <p>Silakan masukkan username dan password Anda.</p>

                <form onSubmit={handleLogin} style={{ width: '100%', textAlign: 'left' }}>
                    <label htmlFor="username">Username</label>
                    <input 
                        id="username"
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        placeholder="Contoh: mpp" 
                        required 
                    />

                    <label htmlFor="password" style={{marginTop: '1rem'}}>Password</label>
                    <input 
                        id="password"
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Contoh: mpp123" 
                        required 
                    />

                    {error && <p style={{ color: 'var(--danger-color)', textAlign: 'center', marginTop: '1rem' }}>{error}</p>}

                    <button type="submit" className="primary" style={{ width: '100%', marginTop: '2rem' }}>
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;