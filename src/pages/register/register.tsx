import { FC, SyntheticEvent, useState } from 'react';
import { RegisterUI } from '@ui-pages';
import { useDispatch } from '../../services/store';
import { registerUser } from '../../services/slices/userSlice';
import { useNavigate } from 'react-router-dom';

export const Register: FC = () => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    setError('');

    if (!userName.trim()) {
      setError('Введите имя');
    }
    if (!email.includes('@')) {
      setError('Введите корректный email');
    }
    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
    }

    dispatch(registerUser({ name: userName, email, password }))
      .unwrap()
      .then(() => navigate('/'))
      .catch((err) => setError(err.message || 'Ошибка регистрации'));
  };

  return (
    <RegisterUI
      errorText={error}
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
