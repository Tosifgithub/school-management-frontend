import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/NewAuthContext';

const API_URL = 'http://localhost:8000/api/admin';

function AddStudentForm({ onAddStudent }) {
  const { auth } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    admissionNo: '',
    name: '',
    age: '',
    class: '',
    section: '',
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data);
      if (res.data.length > 0 && !formData.class) {
        setFormData((prev) => ({ ...prev, class: res.data[0].name }));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch classes');
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [auth]);

  useEffect(() => {
    if (formData.class) {
      const selectedClass = classes.find((c) => c.name === formData.class);
      if (selectedClass) {
        setSections(selectedClass.sections || []);
        setFormData((prev) => ({
          ...prev,
          section: selectedClass.sections?.[0] || '',
        }));
      } else {
        setSections([]);
        setFormData((prev) => ({ ...prev, section: '' }));
      }
    }
  }, [formData.class, classes]);

  const handleChange = (e) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.admissionNo || !formData.name || !formData.class || !formData.section) {
      setError('Admission number, name, class, and section are required');
      return;
    }

    const data = new FormData();
    data.append('admissionNo', formData.admissionNo);
    data.append('name', formData.name);
    data.append('age', formData.age);
    data.append('class', formData.class);
    data.append('section', formData.section);
    if (photo) {
      data.append('photo', photo);
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/addstudents`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(res.data.message);
      setFormData({
        admissionNo: '',
        name: '',
        age: '',
        class: classes[0]?.name || '',
        section: classes[0]?.sections?.[0] || '',
      });
      setPhoto(null);
      setPhotoPreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      onAddStudent();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add student');
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">Add New Student</h3>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm sm:text-base mb-1">Admission No.</label>
            <input
              type="text"
              name="admissionNo"
              value={formData.admissionNo}
              onChange={handleChange}
              className="w-full p-2 border rounded text-sm sm:text-base focus:ring-2 focus:ring-green-500"
              placeholder="e.g., A001"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm sm:text-base mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded text-sm sm:text-base focus:ring-2 focus:ring-green-500"
              placeholder="e.g., John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm sm:text-base mb-1">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full p-2 rounded text-sm sm:text-base border focus:ring-2 focus:ring-green-500"
              placeholder="e.g., 10"
              min="1"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm sm:text-base mb-1">Class</label>
            <select
              name="class"
              value={formData.class}
              onChange={handleChange}
              className="w-full p-2 border rounded text-sm sm:text-base focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select Class</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.name}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm sm:text-base mb-1">Section</label>
            <select
              name="section"
              value={formData.section}
              onChange={handleChange}
              className="w-full p-2 border rounded text-sm sm:text-base focus:ring-2 focus:ring-green-500"
              required
              disabled={!formData.class}
            >
              <option value="">Select Section</option>
              {sections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm sm:text-base mb-1">Photo</label>
            <input
              type="file"
              name="photo"
              accept="image/png,image/jpeg"
              onChange={handleChange}
              ref={fileInputRef}
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
          Add Student
        </button>
      </form>
    </div>
  );
}

export default AddStudentForm;