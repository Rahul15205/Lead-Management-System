import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Filter, RefreshCw, Edit, Trash2 } from 'lucide-react';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    email: '',
    company: '',
    city: '',
    status: '',
    source: '',
    is_qualified: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = ['new', 'contacted', 'qualified', 'lost', 'won'];
  const sourceOptions = ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'];

  const fetchLeads = useCallback(async (page = 1, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });

      // Add filters to params
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value && value !== '') {
          if (key === 'email' || key === 'company' || key === 'city') {
            params.append(key, value);
            params.append(`${key}_operator`, 'contains');
          } else {
            params.append(key, value);
          }
        }
      });

      const response = await axios.get(`/api/leads?${params}`);
      
      if (response.data.success) {
        setLeads(response.data.data);
        setPagination({
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages
        });
      }
    } catch (error) {
      toast.error('Failed to fetch leads');
      console.error('Fetch leads error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLeads(1, filters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      email: '',
      company: '',
      city: '',
      status: '',
      source: '',
      is_qualified: ''
    };
    setFilters(clearedFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLeads(1, clearedFilters);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchLeads(newPage);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/leads/${id}`);
      if (response.data.success) {
        toast.success('Lead deleted successfully');
        fetchLeads(pagination.page);
      }
    } catch (error) {
      toast.error('Failed to delete lead');
      console.error('Delete lead error:', error);
    }
  };

  const ActionsCellRenderer = ({ data }) => {
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Link 
          to={`/leads/edit/${data._id}`}
          className="btn btn-secondary"
          style={{ padding: '4px 8px', fontSize: '12px' }}
        >
          <Edit size={14} />
        </Link>
        <button
          onClick={() => handleDelete(data._id)}
          className="btn btn-danger"
          style={{ padding: '4px 8px', fontSize: '12px' }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    );
  };

  const StatusCellRenderer = ({ value }) => {
    return (
      <span className={`status-badge status-${value}`}>
        {value}
      </span>
    );
  };

  const SourceCellRenderer = ({ value }) => {
    return (
      <span className="source-badge">
        {value.replace('_', ' ')}
      </span>
    );
  };

  const columnDefs = [
    {
      headerName: 'Name',
      valueGetter: (params) => `${params.data.first_name} ${params.data.last_name}`,
      sortable: true,
      filter: true,
      width: 200
    },
    {
      headerName: 'Email',
      field: 'email',
      sortable: true,
      filter: true,
      width: 250
    },
    {
      headerName: 'Company',
      field: 'company',
      sortable: true,
      filter: true,
      width: 200
    },
    {
      headerName: 'Phone',
      field: 'phone',
      width: 150
    },
    {
      headerName: 'City',
      field: 'city',
      sortable: true,
      filter: true,
      width: 120
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: StatusCellRenderer,
      sortable: true,
      width: 120
    },
    {
      headerName: 'Source',
      field: 'source',
      cellRenderer: SourceCellRenderer,
      sortable: true,
      width: 140
    },
    {
      headerName: 'Score',
      field: 'score',
      sortable: true,
      width: 100,
      cellStyle: { textAlign: 'center' }
    },
    {
      headerName: 'Lead Value',
      field: 'lead_value',
      valueFormatter: (params) => `$${params.value?.toLocaleString()}`,
      sortable: true,
      width: 120,
      cellStyle: { textAlign: 'right' }
    },
    {
      headerName: 'Qualified',
      field: 'is_qualified',
      valueFormatter: (params) => params.value ? 'Yes' : 'No',
      width: 100,
      cellStyle: { textAlign: 'center' }
    },
    {
      headerName: 'Actions',
      cellRenderer: ActionsCellRenderer,
      width: 120,
      sortable: false,
      filter: false,
      cellStyle: { textAlign: 'center' }
    }
  ];

  const defaultColDef = {
    resizable: true,
    sortable: false,
    filter: false
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`page-btn ${i === pagination.page ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <div className="pagination-info">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
          {pagination.total} leads
        </div>
        <div className="pagination-controls">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="page-btn"
          >
            Previous
          </button>
          {pages}
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="page-btn"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Leads Dashboard</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary"
          >
            <Filter size={16} />
            Filters
          </button>
          <button
            onClick={() => fetchLeads(pagination.page)}
            className="btn btn-secondary"
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <Link to="/leads/new" className="btn btn-primary">
            <Plus size={16} />
            Add Lead
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="filters-section">
          <div className="filters-grid">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="text"
                name="email"
                value={filters.email}
                onChange={handleFilterChange}
                className="form-input"
                placeholder="Search by email..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Company</label>
              <input
                type="text"
                name="company"
                value={filters.company}
                onChange={handleFilterChange}
                className="form-input"
                placeholder="Search by company..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                className="form-input"
                placeholder="Search by city..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Source</label>
              <select
                name="source"
                value={filters.source}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="">All Sources</option>
                {sourceOptions.map(source => (
                  <option key={source} value={source}>
                    {source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Qualified</label>
              <select
                name="is_qualified"
                value={filters.is_qualified}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="">All</option>
                <option value="true">Qualified</option>
                <option value="false">Not Qualified</option>
              </select>
            </div>
          </div>
          <div className="filters-actions">
            <button onClick={clearFilters} className="btn btn-secondary">
              Clear Filters
            </button>
            <button onClick={applyFilters} className="btn btn-primary">
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="empty-state">
            <h3>No leads found</h3>
            <p>Start by adding your first lead or adjust your filters.</p>
            <Link to="/leads/new" className="btn btn-primary" style={{ marginTop: '16px' }}>
              <Plus size={16} />
              Add Your First Lead
            </Link>
          </div>
        ) : (
          <>
            <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
              <AgGridReact
                rowData={leads}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination={false}
                suppressPaginationPanel={true}
                rowHeight={48}
                headerHeight={48}
              />
            </div>
            {pagination.totalPages > 1 && renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
