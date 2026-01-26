import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { Building2, Lock, Mail } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'Admin',
    employee_id: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isRegister ? `${API}/auth/register` : `${API}/auth/login`;
      const payload = isRegister 
        ? formData 
        : { email: formData.email, password: formData.password, role: formData.role };
      
      const response = await axios.post(endpoint, payload);
      
      toast.success(isRegister ? 'Registration successful!' : 'Login successful!');
      onLogin(response.data.user, response.data.token);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 login-hero items-center justify-center">
        <div className="relative z-10 text-white text-center px-8">
          <Building2 className="w-20 h-20 mx-auto mb-6" strokeWidth={1.5} />
          <h1 className="text-5xl font-bold uppercase tracking-tight mb-4">
            Civil Project
            <br />
            Management
          </h1>
          <p className="text-lg text-slate-300 max-w-md mx-auto">
            Streamline your construction projects with precision and efficiency
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-md border border-slate-200 p-8 technical-shadow">
            <div className="mb-8">
              <h2 className="text-3xl font-bold uppercase tracking-tight text-slate-900 mb-2">
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-sm text-slate-600">
                {isRegister ? 'Register your account to get started' : 'Sign in to access your dashboard'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isRegister && (
                <div>
                  <Label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-slate-700">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    data-testid="register-name-input"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 rounded-sm border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-slate-50"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-slate-700">
                  Email Address
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="email"
                    data-testid="login-email-input"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 rounded-sm border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-slate-50"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-slate-700">
                  Password
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="password"
                    data-testid="login-password-input"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 rounded-sm border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-slate-50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role" className="text-xs font-medium uppercase tracking-wider text-slate-700">
                  Role
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger data-testid="login-role-select" className="mt-1 rounded-sm border-slate-300 focus:ring-2 focus:ring-slate-900 bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Engineer">Engineer</SelectItem>
                    <SelectItem value="Client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isRegister && (
                <div>
                  <Label htmlFor="employee_id" className="text-xs font-medium uppercase tracking-wider text-slate-700">
                    Employee ID (Optional)
                  </Label>
                  <Input
                    id="employee_id"
                    data-testid="register-employee-id-input"
                    type="text"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    className="mt-1 rounded-sm border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-slate-50"
                    placeholder="EMP-001"
                  />
                </div>
              )}

              <Button
                type="submit"
                data-testid="login-submit-button"
                disabled={loading}
                className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-sm btn-press transition-all py-6 text-base font-semibold uppercase tracking-wider"
              >
                {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-sm text-sky-500 hover:text-sky-600 font-medium"
                data-testid="toggle-auth-mode-button"
              >
                {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            <p>© 2025 Civil Engineering Project Management System</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
