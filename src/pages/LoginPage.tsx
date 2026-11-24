import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { authAxios } from '../api';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginSuccess, setAuthError } from '../slices/userSlice';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const error = useAppSelector((state) => state.user.error);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Вход — Расчет энергопотребления';
    dispatch(setAuthError(null));
  }, [dispatch]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      dispatch(setAuthError('Введите имя пользователя и пароль'));
      return;
    }

    setSubmitting(true);
    dispatch(setAuthError(null));
    try {
      const response = await authAxios.post<{
        session_id: string;
        token: string;
        user_id: number;
      }>('/api/users/login', {
        username: trimmedUser,
        password,
      });

      dispatch(
        loginSuccess({
          username: trimmedUser,
          userId: response.data.user_id,
        })
      );
      navigate('/');
    } catch {
      dispatch(setAuthError('Неверный логин или пароль'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <h1 className="login-title">Вход в систему</h1>
        <p className="login-subtitle">Авторизация создателя моделей камер</p>
      </header>

      <main className="login-content">
        {error && (
          <Alert variant="danger" className="login-alert">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit} className="login-form">
          <Form.Group controlId="login_username" className="login-field-group">
            <Form.Label className="login-field-label">Логин</Form.Label>
            <Form.Control
              type="text"
              className="login-field-input"
              placeholder="Например, admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={submitting}
              autoComplete="username"
              required
            />
          </Form.Group>

          <Form.Group controlId="login_password" className="login-field-group">
            <Form.Label className="login-field-label">Пароль</Form.Label>
            <Form.Control
              type="password"
              className="login-field-input"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              autoComplete="current-password"
              required
            />
          </Form.Group>

          <Button
            type="submit"
            bsPrefix="login-submit-btn"
            disabled={submitting}
          >
            {submitting ? <Spinner animation="border" size="sm" /> : 'Войти'}
          </Button>
        </Form>
      </main>
    </div>
  );
};
