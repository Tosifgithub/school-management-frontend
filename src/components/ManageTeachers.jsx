import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/NewAuthContext';

const API_URL = 'http://localhost:8000/api/admin';

function ManageTeachers() {
  const { auth, logout } = useContext(AuthContext);
  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobileNo: '',
    email: '',
  });
  const [editTeacherId, setEditTeacherId] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const addFileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const navigate = useNavigate();

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const res = await axios.get(`${API_URL}/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(res.data);
      console.log('Teachers:', res.data);
      setError('');
    } catch (err) {
      console.error('Fetch teachers error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to fetch teachers');
      }
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [auth]);

  const handleChange = (e, formType = 'add') => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      const file = files[0];
      if (file) {
        if (!['image/png', 'image/jpeg'].includes(file.type)) {
          setError('Please upload a PNG or JPEG image');
          setPhoto(null);
          setPhotoPreview('');
          return;
        }
        if (file.size > 1 * 1024 * 1024) {
          setError('Photo must be less than 1MB');
          setPhoto(null);
          setPhotoPreview('');
          return;
        }
        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
        setError('');
      } else {
        setPhoto(null);
        setPhotoPreview('');
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name) {
      return 'Name is required';
    }
    if (!formData.email) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Invalid email format';
    }
    return null;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('mobileNo', formData.mobileNo);
    data.append('email', formData.email);
    if (photo) {
      data.append('photo', photo);
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const res = await axios.post(`${API_URL}/addteachers`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(res.data.message);
      setFormData({ name: '', mobileNo: '', email: '' });
      setPhoto(null);
      setPhotoPreview('');
      setIsAddFormOpen(false);
      if (addFileInputRef.current) {
        addFileInputRef.current.value = null;
      }
      fetchTeachers();
    } catch (err) {
      console.error('Add submit error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to add teacher');
    }
  };

  const handleEditClick = (teacher) => {
    setFormData({
      name: teacher.name,
      mobileNo: teacher.mobileNo || '',
      email: teacher.email,
    });
    setEditTeacherId(teacher.id);
    setPhoto(null);
    setPhotoPreview(teacher.photo ? `http://localhost:8000${teacher.photo}` : '');
    setIsEditFormOpen(true);
    setIsAddFormOpen(false);
    setError('');
    setSuccess('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('mobileNo', formData.mobileNo);
    data.append('email', formData.email);
    if (photo) {
      data.append('photo', photo);
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const res = await axios.patch(`${API_URL}/teachers/${editTeacherId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(res.data.message);
      setFormData({ name: '', mobileNo: '', email: '' });
      setPhoto(null);
      setPhotoPreview('');
      setIsEditFormOpen(false);
      setEditTeacherId(null);
      if (editFileInputRef.current) {
        editFileInputRef.current.value = null;
      }
      fetchTeachers();
    } catch (err) {
      console.error('Edit submit error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to update teacher');
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">Manage Teachers</h3>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      {/* Add New Teacher Button */}
      <div className="mb-4">
        <button
          onClick={() => {
            setIsAddFormOpen(!isAddFormOpen);
            setIsEditFormOpen(false);
            setFormData({ name: '', mobileNo: '', email: '' });
            setPhoto(null);
            setPhotoPreview('');
            setError('');
            setSuccess('');
            if (addFileInputRef.current) {
              addFileInputRef.current.value = null;
            }
          }}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm sm:text-base"
        >
          {isAddFormOpen ? 'Cancel' : 'Add New Teacher'}
        </button>
      </div>

      {/* Add Teacher Form */}
      {isAddFormOpen && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h4 className="text-md sm:text-lg font-semibold mb-4 text-gray-800">Add New Teacher</h4>
          <form onSubmit={handleAddSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm sm:text-base mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-sm sm:text-base focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., John Smith"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm sm:text-base mb-1">Mobile No.</label>
                <input
                  type="text"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-sm sm:text-base focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 1234567890"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm sm:text-base mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-sm sm:text-base focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., john@school.com"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm sm:text-base mb-1">Photo</label>
                <input
                  type="file"
                  name="photo"
                  accept="image/png,image/jpeg"
                  onChange={handleChange}
                  ref={addFileInputRef}
                  className="w-full p-2 border rounded text-sm sm:text-base"
                />
                {photoPreview ? (
                  <div className="mt-2">
                    <img
                      src={photoPreview}
                      alt="Photo preview"
                      className="h-16 w-16 object-contain rounded"
                    />
                  </div>
                ) : (
                  <p className="mt-2 text-gray-600 text-sm">No file selected</p>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white p-2 sm:p-3 rounded hover:bg-green-600 text-sm sm:text-base"
            >
              Add Teacher
            </button>
          </form>
        </div>
      )}

      {/* Edit Teacher Form */}
      {isEditFormOpen && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h4 className="text-md sm:text-lg font-semibold mb-4 text-gray-800">Edit Teacher</h4>
          <form onSubmit={handleEditSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm sm:text-base mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleChange(e, 'edit')}
                  className="w-full p-2 border rounded text-sm sm:text-base focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., John Smith"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm sm:text-base mb-1">Mobile No.</label>
                <input
                  type="text"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={(e) => handleChange(e, 'edit')}
                  className="w-full p-2 border rounded text-sm sm:text-base focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 1234567890"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm sm:text-base mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => handleChange(e, 'edit')}
                  className="w-full p-2 border rounded text-sm sm:text-base focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., john@school.com"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm sm:text-base mb-1">Photo</label>
                <input
                  type="file"
                  name="photo"
                  accept="image/png,image/jpeg"
                  onChange={(e) => handleChange(e, 'edit')}
                  ref={editFileInputRef}
                  className="w-full p-2 border rounded text-sm sm:text-base"
                />
                {photoPreview ? (
                  <div className="mt-2">
                    <img
                      src={photoPreview}
                      alt="Photo preview"
                      className="h-16 w-16 object-contain rounded"
                    />
                  </div>
                ) : (
                  <p className="mt-2 text-gray-600 text-sm">No file selected</p>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 sm:p-3 rounded hover:bg-blue-600 text-sm sm:text-base"
              >
                Update Teacher
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditFormOpen(false);
                  setFormData({ name: '', mobileNo: '', email: '' });
                  setPhoto(null);
                  setPhotoPreview('');
                  setEditTeacherId(null);
                  if (editFileInputRef.current) {
                    editFileInputRef.current.value = null;
                  }
                }}
                className="w-full bg-gray-500 text-white p-2 sm:p-3 rounded hover:bg-gray-600 text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teachers Table */}
      {teachers.length === 0 ? (
        <p className="text-gray-600">No teachers found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-left text-sm sm:text-base">Sr. No.</th>
                <th className="border p-2 text-left text-sm sm:text-base">Name</th>
                <th className="border p-2 text-left text-sm sm:text-base">Mobile No.</th>
                <th className="border p-2 text-left text-sm sm:text-base">Email Address</th>
                <th className="border p-2 text-left text-sm sm:text-base">Photo</th>
                <th className="border p-2 text-left text-sm sm:text-base">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher, index) => (
                <tr key={teacher.id} className="border">
                  <td className="p-2 border text-center text-sm sm:text-base">{index + 1}</td>
                  <td className="p-2 border text-center text-sm sm:text-base">{teacher.name}</td>
                  <td className="p-2 border text-center text-sm sm:text-base">{teacher.mobileNo || '-'}</td>
                  <td className="p-2 border text-center text-sm sm:text-base">{teacher.email}</td>
                  <td className="p-2 border flex justify-center items-center text-sm sm:text-base">
                    {teacher.photo ? (
                      <img
                        src={`http://localhost:8000${teacher.photo}`}
                        alt={`${teacher.name}'s photo`}
                        className="h-16 w-16 object-contain rounded"
                      />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="p-2 border text-center text-sm sm:text-base">
                    <button
                      onClick={() => handleEditClick(teacher)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageTeachers;