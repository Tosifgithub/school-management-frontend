import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/NewAuthContext';

const API_URL = 'http://localhost:8000/api/admin';

function ManageClasses() {
  const { auth, logout } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    section: '',
  });
  const navigate = useNavigate();

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const res = await axios.get(`${API_URL}/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data);
      console.log('Classes:', res.data);
      setError('');
    } catch (err) {
      console.error('Fetch classes error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to fetch classes');
      }
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [auth]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name) {
      return 'Class name is required';
    }
    if (!formData.section) {
      return 'Section is required';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const res = await axios.post(
        `${API_URL}/addclasses`,
        {
          name: formData.name,
          section: formData.section,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess(res.data.message);
      setFormData({ name: '', section: '' });
      setIsFormOpen(false);
      fetchClasses();
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to add class');
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">Manage Classes</h3>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      {/* Add New Class Button */}
      <div className="mb-4">
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm sm:text-base"
        >
          {isFormOpen ? 'Cancel' : 'Add New Class'}
        </button>
      </div>

      {/* Add Class Form */}
      {isFormOpen && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h4 className="text-md sm:text-lg font-semibold mb-4 text-gray-800">Add New Class or Section</h4>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm sm:text-base mb-1">Class Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-sm sm:text-base focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Nursery"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm sm:text-base mb-1">Section</label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-sm sm:text-base focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., A"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white p-2 sm:p-3 rounded hover:bg-green-600 text-sm sm:text-base"
            >
              Add Class/Section
            </button>
          </form>
        </div>
      )}

      {/* Classes Table */}
      {classes.length === 0 ? (
        <p className="text-gray-600">No classes found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-center text-sm sm:text-base">Sr. No.</th>
                <th className="border p-2 text-center text-sm sm:text-base">Class Name</th>
                <th className="border p-2 text-center text-sm sm:text-base">Sections</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((classItem, index) => (
                <tr key={classItem.id} className="border">
                  <td className="p-2 border text-center text-sm sm:text-base">{index + 1}</td>
                  <td className="p-2 border text-center text-sm sm:text-base">{classItem.name}</td>
                  <td className="p-2 border text-center text-sm sm:text-base">{classItem.sections.join(', ') || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageClasses;