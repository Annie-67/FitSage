import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Avatar,
} from '@mui/material';
import { Edit, Save } from '@mui/icons-material';
import { useAuth } from '../utils/AuthContext';
import { userAPI } from '../services/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isFirstTime = location.state?.firstTime;
  const [editing, setEditing] = useState(isFirstTime || false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.profile?.age || '',
    gender: user?.profile?.gender || '',
    height: user?.profile?.height || '',
    weight: user?.profile?.weight || '',
    fitnessLevel: user?.profile?.fitnessLevel || 'beginner',
    activityLevel: user?.profile?.activityLevel || 'sedentary',
  });

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Update user name
      if (formData.name !== user.name) {
        await userAPI.updateUser({ name: formData.name });
      }

      // Update profile
      const profileData = {
        age: parseInt(formData.age) || undefined,
        gender: formData.gender,
        height: parseInt(formData.height) || undefined,
        weight: parseFloat(formData.weight) || undefined,
        fitnessLevel: formData.fitnessLevel,
        activityLevel: formData.activityLevel,
      };

      const response = await userAPI.updateProfile(profileData);
      updateUser(response.data.user);

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);

      // Redirect to dashboard if first-time user
      if (isFirstTime) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      age: user?.profile?.age || '',
      gender: user?.profile?.gender || '',
      height: user?.profile?.height || '',
      weight: user?.profile?.weight || '',
      fitnessLevel: user?.profile?.fitnessLevel || 'beginner',
      activityLevel: user?.profile?.activityLevel || 'sedentary',
    });
    setEditing(false);
    setMessage({ type: '', text: '' });
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          {isFirstTime ? 'Welcome to FitSage! 🎉' : 'Profile'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isFirstTime
            ? 'Let\'s set up your profile to get personalized workout and nutrition plans'
            : 'Manage your personal information'}
        </Typography>
      </Box>

      {isFirstTime && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Please complete your profile to get started with personalized fitness plans!
        </Alert>
      )}

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      {/* Profile Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: 32,
                mr: 3,
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={600}>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            {!isFirstTime && (
              <Button
                variant={editing ? 'outlined' : 'contained'}
                startIcon={editing ? <Save /> : <Edit />}
                onClick={() => (editing ? handleSave() : setEditing(true))}
                disabled={saving}
              >
                {editing ? 'Save' : 'Edit Profile'}
              </Button>
            )}
            {isFirstTime && (
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={saving || !formData.age || !formData.gender || !formData.height || !formData.weight}
              >
                {saving ? 'Saving...' : 'Complete Profile'}
              </Button>
            )}
            {editing && !isFirstTime && (
              <Button
                variant="text"
                onClick={handleCancel}
                disabled={saving}
                sx={{ ml: 1 }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Personal Information
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!editing}>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Height (cm)"
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Weight (kg)"
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!editing}>
                <InputLabel>Fitness Level</InputLabel>
                <Select
                  value={formData.fitnessLevel}
                  onChange={(e) => setFormData({ ...formData, fitnessLevel: e.target.value })}
                  label="Fitness Level"
                >
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!editing}>
                <InputLabel>Activity Level</InputLabel>
                <Select
                  value={formData.activityLevel}
                  onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                  label="Activity Level"
                >
                  <MenuItem value="sedentary">Sedentary</MenuItem>
                  <MenuItem value="lightly-active">Lightly Active</MenuItem>
                  <MenuItem value="moderately-active">Moderately Active</MenuItem>
                  <MenuItem value="very-active">Very Active</MenuItem>
                  <MenuItem value="extremely-active">Extremely Active</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
