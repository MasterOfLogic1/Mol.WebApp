import React, { useState, useEffect } from 'react';
import { getUserProfile, createUserProfile, updateUserProfile, changePassword } from '../api/profileApi';
import './Profile.css';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    middlename: '',
    phonenumber: '',
    occupation: '',
    bio: '',
    thumbnail: null,
  });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserProfile();
      setProfile(data);
      setFormData({
        firstname: data.firstname || '',
        lastname: data.lastname || '',
        middlename: data.middlename || '',
        phonenumber: data.phonenumber || '',
        occupation: data.occupation || '',
        bio: data.bio || '',
        thumbnail: null,
      });
      setThumbnailPreview(data.thumbnail_url || null);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
      // If profile doesn't exist, form will be empty for creation
      if (err.message && !err.message.includes('404') && !err.message.includes('Not found')) {
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'thumbnail' && files && files[0]) {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        thumbnail: file,
      }));
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (profile) {
        await updateUserProfile(formData);
        setSuccess('Profile updated successfully!');
      } else {
        await createUserProfile(formData);
        setSuccess('Profile created successfully!');
      }
      fetchProfile();
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.new_password !== passwordData.confirm_new_password) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    try {
      await changePassword(passwordData);
      setSuccess('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_new_password: '',
      });
      setShowPasswordForm(false);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="profile">
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <h2>My Profile</h2>
        <p>Manage your profile information and settings</p>
      </div>

      {error && <div className="profile-error">{error}</div>}
      {success && <div className="profile-success">{success}</div>}

      <div className="profile-content">
        <div className="profile-section">
          <h3>Profile Information</h3>
          <form className="profile-form" onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <div className="thumbnail-upload-section">
                <div className="thumbnail-preview-container">
                  {thumbnailPreview ? (
                    <div className="thumbnail-preview-large">
                      <img src={thumbnailPreview} alt="Profile preview" />
                      <div className="thumbnail-overlay">
                        <label htmlFor="thumbnail" className="thumbnail-upload-label">
                          <span className="upload-icon">📷</span>
                          <span>Change Photo</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, thumbnail: null }));
                            setThumbnailPreview(profile?.thumbnail_url || null);
                            const fileInput = document.getElementById('thumbnail');
                            if (fileInput) fileInput.value = '';
                          }}
                          className="thumbnail-remove-btn"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="thumbnail-placeholder">
                      <label htmlFor="thumbnail" className="thumbnail-upload-label">
                        <span className="upload-icon">📷</span>
                        <span>Upload Photo</span>
                      </label>
                    </div>
                  )}
                  <input
                    type="file"
                    id="thumbnail"
                    name="thumbnail"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="thumbnail-input-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstname">First Name *</label>
                <input
                  type="text"
                  id="firstname"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastname">Last Name *</label>
                <input
                  type="text"
                  id="lastname"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="middlename">Middle Name</label>
              <input
                type="text"
                id="middlename"
                name="middlename"
                value={formData.middlename}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phonenumber">Phone Number</label>
              <input
                type="tel"
                id="phonenumber"
                name="phonenumber"
                value={formData.phonenumber}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="occupation">Occupation</label>
              <input
                type="text"
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                placeholder="e.g., Software Engineer, Designer, Writer"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="4"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {profile ? 'Update Profile' : 'Create Profile'}
              </button>
            </div>
          </form>
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h3>Change Password</h3>
            <button
              type="button"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="toggle-btn"
            >
              {showPasswordForm ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {showPasswordForm && (
            <form className="profile-form" onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="current_password">Current Password *</label>
                <input
                  type="password"
                  id="current_password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="new_password">New Password *</label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm_new_password">Confirm New Password *</label>
                <input
                  type="password"
                  id="confirm_new_password"
                  name="confirm_new_password"
                  value={passwordData.confirm_new_password}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Change Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;

