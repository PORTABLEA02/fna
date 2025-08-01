import React, { useState } from 'react';
import { Heart, Lock, Mail, AlertCircle, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  
  // Données pour l'inscription
  const [signUpData, setSignUpData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'secretary' as 'admin' | 'doctor' | 'secretary',
    phone: '',
    speciality: ''
  });

  const { login, signUp, loading } = useAuth();

  // Afficher un loader pendant le chargement initial
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="bg-blue-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 animate-pulse">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <p className="text-gray-600">Chargement de l'application...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Email ou mot de passe incorrect');
      }
      // Si le login réussit, l'utilisateur sera redirigé automatiquement
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (signUpData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (!signUpData.firstName || !signUpData.lastName || !signUpData.phone) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (signUpData.role === 'doctor' && !signUpData.speciality) {
      setError('La spécialité est requise pour les médecins');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp(signUpData.email, signUpData.password, {
        firstName: signUpData.firstName,
        lastName: signUpData.lastName,
        role: signUpData.role,
        phone: signUpData.phone,
        speciality: signUpData.speciality || undefined
      });

      if (result.success) {
        setShowSignUp(false);
        setError('');
        // Réinitialiser le formulaire
        setSignUpData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'secretary',
          phone: '',
          speciality: ''
        });
        // Afficher un message de succès
        alert('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
      } else {
        setError(result.error || 'Erreur lors de la création du compte');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la création du compte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
  };

  if (showSignUp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="bg-blue-600 p-3 rounded-full w-16 h-16 mx-auto mb-4">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Créer un Compte</h1>
              <p className="text-gray-600 mt-2">CliniCare - Système de Gestion Médicale</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={signUpData.firstName}
                    onChange={handleSignUpChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={signUpData.lastName}
                    onChange={handleSignUpChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={signUpData.email}
                  onChange={handleSignUpChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={signUpData.phone}
                  onChange={handleSignUpChange}
                  required
                  placeholder="+237 690 000 000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle *
                  </label>
                  <select
                    name="role"
                    value={signUpData.role}
                    onChange={handleSignUpChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="secretary">Personnel soignant</option>
                    <option value="doctor">Médecin</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>

                {signUpData.role === 'doctor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spécialité *
                    </label>
                    <input
                      type="text"
                      name="speciality"
                      value={signUpData.speciality}
                      onChange={handleSignUpChange}
                      required
                      placeholder="Ex: Cardiologie, Médecine générale..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={signUpData.password}
                      onChange={handleSignUpChange}
                      required
                      minLength={6}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le mot de passe *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={signUpData.confirmPassword}
                    onChange={handleSignUpChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {isLoading ? 'Création du compte...' : 'Créer le compte'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowSignUp(false)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Déjà un compte ? Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-600 p-3 rounded-full w-16 h-16 mx-auto mb-4">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">CliniCare</h1>
            <p className="text-gray-600 mt-2">Système de Gestion Médicale</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center space-y-3">
              <button
                onClick={() => setShowSignUp(true)}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Créer un nouveau compte</span>
              </button>
              
              <p className="text-sm text-gray-600">
                Besoin d'aide ? Contactez l'administrateur système.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}