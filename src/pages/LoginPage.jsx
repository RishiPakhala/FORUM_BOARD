import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { loginUser } from "@/services/api";
import "./LoginPage.css";
import logo from "../assets/logo.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await loginUser({ email, password });
      
      // Store user data and token in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role
      }));

      toast({
        title: "Success",
        description: `Welcome back, ${response.data.user.name}!`,
      });
      
      navigate("/threads");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.error || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left side - Gradient banner */}
      <div className="login-banner">
        <div className="banner-logo-container">
          <img 
            src={logo}
            alt="Logo" 
            className="banner-logo"
            style={{ width: "75px", height: "75px", borderRadius: "50%" }} 
          />
          <h2 className="banner-title">ConnectForum.IO</h2>
        </div>

        <h1 className="banner-heading">ConnectForum – Where Ideas Spark and Conversations Thrive!</h1>
        
        <p className="banner-text">
          Join a vibrant community, share insights, and engage in meaningful discussions. Log in now and be part of the conversation!
        </p>
      </div>

      {/* Right side - Login form */}
      <div className="login-form-container">
        <div className="login-form-content">
          <h1 className="login-heading">Login</h1>
          <p className="login-subheading">
            Welcome back! Please enter your credentials to access your account.
          </p>
          
          {/* Google login button */}
          <button className="google-button">
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            Login with Google
          </button>

          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">or</span>
            <div className="divider-line"></div>
          </div>

          {/* Email login form */}
          <form onSubmit={handleLogin}>
            <div className="login-form-group">
              <label htmlFor="email" className="login-form-label">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yayan@durian.cc"
                className="login-form-input"
                disabled={isLoading}
              />
            </div>

            <div className="login-form-group">
              <div className="password-header">
                <label htmlFor="password" className="login-form-label">Password</label>
                <Link to="/forgot-password" className="forgot-password">
                  Forgot Password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••••••"
                className="login-form-input"
                disabled={isLoading}
              />
            </div>

            <div className="remember-me">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="remember-checkbox"
              />
              <label htmlFor="remember-me" className="remember-label">
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p className="register-link-container">
            Don't have an account?{" "}
            <Link to="/register" className="register-link">
              Create one!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 