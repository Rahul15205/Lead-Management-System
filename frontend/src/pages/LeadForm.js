import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, User, Mail, Phone, Building, MapPin, Globe, DollarSign, Star } from 'lucide-react';

const LeadForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetchingLead, setFetchingLead] = useState(isEditing);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      city: '',
      state: '',
      source: 'website',
      status: 'new',
      score: 50,
      lead_value: 1000,
      is_qualified: false
    }
  });

  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'lost', label: 'Lost' },
    { value: 'won', label: 'Won' }
  ];

  const sourceOptions = [
    { value: 'website', label: 'Website' },
    { value: 'facebook_ads', label: 'Facebook Ads' },
    { value: 'google_ads', label: 'Google Ads' },
    { value: 'referral', label: 'Referral' },
    { value: 'events', label: 'Events' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (isEditing) {
      fetchLead();
    }
  }, [id, isEditing]);

  const fetchLead = async () => {
    try {
      const response = await axios.get(`/api/leads/${id}`);
      if (response.data.success) {
        const lead = response.data.data;
        Object.keys(lead).forEach(key => {
          if (key !== '_id' && key !== 'user' && key !== 'created_at' && key !== 'updated_at' && key !== '__v') {
            setValue(key, lead[key]);
          }
        });
      }
    } catch (error) {
      toast.error('Failed to fetch lead details');
      navigate('/dashboard');
    } finally {
      setFetchingLead(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = isEditing
        ? await axios.put(`/api/leads/${id}`, data)
        : await axios.post('/api/leads', data);

      if (response.data.success) {
        toast.success(`Lead ${isEditing ? 'updated' : 'created'} successfully!`);
        navigate('/dashboard');
      }
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} lead`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingLead) {
    return (
      <div className="container" style={{ marginTop: '40px' }}>
        <div className="loading">Loading lead details...</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '20px', maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-secondary"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>
          {isEditing ? 'Edit Lead' : 'Add New Lead'}
        </h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Personal Information */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
              <User size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Personal Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className="form-input"
                  {...register('first_name', { required: 'First name is required' })}
                  placeholder="Enter first name"
                />
                {errors.first_name && (
                  <div className="error-message">{errors.first_name.message}</div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  className="form-input"
                  {...register('last_name', { required: 'Last name is required' })}
                  placeholder="Enter last name"
                />
                {errors.last_name && (
                  <div className="error-message">{errors.last_name.message}</div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
              <Mail size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Contact Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-input"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                      message: 'Please enter a valid email'
                    }
                  })}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <div className="error-message">{errors.email.message}</div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Phone size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Phone *
                </label>
                <input
                  type="tel"
                  className="form-input"
                  {...register('phone', { required: 'Phone is required' })}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <div className="error-message">{errors.phone.message}</div>
                )}
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
              <Building size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Company Information
            </h2>
            <div className="form-group">
              <label className="form-label">Company *</label>
              <input
                type="text"
                className="form-input"
                {...register('company', { required: 'Company is required' })}
                placeholder="Enter company name"
              />
              {errors.company && (
                <div className="error-message">{errors.company.message}</div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  City *
                </label>
                <input
                  type="text"
                  className="form-input"
                  {...register('city', { required: 'City is required' })}
                  placeholder="Enter city"
                />
                {errors.city && (
                  <div className="error-message">{errors.city.message}</div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">State *</label>
                <input
                  type="text"
                  className="form-input"
                  {...register('state', { required: 'State is required' })}
                  placeholder="Enter state"
                />
                {errors.state && (
                  <div className="error-message">{errors.state.message}</div>
                )}
              </div>
            </div>
          </div>

          {/* Lead Details */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
              <Globe size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Lead Details
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Source *</label>
                <select
                  className="form-select"
                  {...register('source', { required: 'Source is required' })}
                >
                  {sourceOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.source && (
                  <div className="error-message">{errors.source.message}</div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Status *</label>
                <select
                  className="form-select"
                  {...register('status', { required: 'Status is required' })}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <div className="error-message">{errors.status.message}</div>
                )}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">
                  <Star size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Score (0-100) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-input"
                  {...register('score', {
                    required: 'Score is required',
                    min: { value: 0, message: 'Score must be at least 0' },
                    max: { value: 100, message: 'Score must be at most 100' }
                  })}
                  placeholder="Enter score (0-100)"
                />
                {errors.score && (
                  <div className="error-message">{errors.score.message}</div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">
                  <DollarSign size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Lead Value *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  {...register('lead_value', {
                    required: 'Lead value is required',
                    min: { value: 0, message: 'Lead value must be positive' }
                  })}
                  placeholder="Enter lead value"
                />
                {errors.lead_value && (
                  <div className="error-message">{errors.lead_value.message}</div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  {...register('is_qualified')}
                />
                <span className="form-label" style={{ marginBottom: 0 }}>
                  Mark as Qualified Lead
                </span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <Save size={16} />
              {loading ? 'Saving...' : (isEditing ? 'Update Lead' : 'Create Lead')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadForm;
