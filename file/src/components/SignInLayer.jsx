import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { adminAuthService } from "../api/services";

const SignInLayer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await adminAuthService.login(formData.email, formData.password);
      toast.success(response.message || "Login successful!");

      // Log the admin info
      console.log("Logged in as:", response.admin);

      navigate("/"); // Redirect to dashboard
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='auth bg-base d-flex flex-wrap'>
      <div className='auth-left d-lg-block d-none'>
        <div className='d-flex align-items-center flex-column h-100 justify-content-center'>
          <img src='assets/images/auth/auth-img.png' alt='' />
        </div>
      </div>
      <div className='auth-right py-32 px-24 d-flex flex-column justify-content-center'>
        <div className='max-w-464-px mx-auto w-100'>
          <div>
            <Link to='/' className='mb-40 max-w-290-px'>
              <img src='assets/images/logo.png' alt='' />
            </Link>
            <h4 className='mb-12'>Sign In to your Account</h4>
            <p className='mb-32 text-secondary-light text-lg'>
              Welcome back! please enter your detail
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className='icon-field mb-16'>
              <span className='icon top-50 translate-middle-y'>
                <Icon icon='mage:email' />
              </span>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                className='form-control h-56-px bg-neutral-50 radius-12'
                placeholder='Email'
                required
              />
            </div>
            <div className='position-relative mb-20'>
              <div className='icon-field'>
                <span className='icon top-50 translate-middle-y'>
                  <Icon icon='solar:lock-password-outline' />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  className='form-control h-56-px bg-neutral-50 radius-12'
                  id='your-password'
                  placeholder='Password'
                  required
                />
              </div>
              <span
                className='toggle-password cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light'
                onClick={() => setShowPassword(!showPassword)}
              >
                <Icon icon={showPassword ? 'ri:eye-off-line' : 'ri:eye-line'} />
              </span>
            </div>

            <div className=''>
              <div className='d-flex justify-content-between gap-2'>
                <div className='form-check style-check d-flex align-items-center'>
                  <input
                    className='form-check-input border border-neutral-300'
                    type='checkbox'
                    name='rememberMe'
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    id='remeber'
                  />
                  <label className='form-check-label' htmlFor='remeber'>
                    Remember me{" "}
                  </label>
                </div>
                <Link to='/forgot-password' className='text-primary-600 fw-medium'>
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32'
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
            <div className='mt-32 center-border-horizontal text-center'>
              <span className='bg-base z-1 px-4'>Or sign in with</span>
            </div>
            <div className='mt-32 d-flex align-items-center gap-3'>
              <button
                type='button'
                className='fw-semibold text-primary-light py-16 px-24 w-50 border radius-12 text-md d-flex align-items-center justify-content-center gap-12 line-height-1 bg-hover-primary-50'
              >
                <Icon
                  icon='ic:baseline-facebook'
                  className='text-primary-600 text-xl line-height-1'
                />
                Google
              </button>
              <button
                type='button'
                className='fw-semibold text-primary-light py-16 px-24 w-50 border radius-12 text-md d-flex align-items-center justify-content-center gap-12 line-height-1 bg-hover-primary-50'
              >
                <Icon
                  icon='logos:google-icon'
                  className='text-primary-600 text-xl line-height-1'
                />
                Google
              </button>
            </div>
            <div className='mt-32 text-center text-sm'>
              <p className='mb-0'>
                Don’t have an account?{" "}
                <Link to='/sign-up' className='text-primary-600 fw-semibold'>
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignInLayer;
