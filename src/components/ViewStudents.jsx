import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/NewAuthContext';

const API_URL = 'http://localhost:8000/api/admin';

function ViewStudents() {
  const { auth, logout } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    admissionNo: '',
    class: '',
    section: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const res = await axios.get(`${API_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);
      setFilteredStudents(res.data);
      console.log('Students:', res.data);
      setError('');
    } catch (err) {
      console.error('Fetch students error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to fetch students');
      }
    }
  };

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data);
    } catch (err) {
      console.error('Fetch classes error:', err);
      setError(err.response?.data?.error || 'Failed to fetch classes');
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, [auth]);

  useEffect(() => {
    if (filters.class) {
      const selectedClass = classes.find((c) => c.name === filters.class);
      setSections(selectedClass ? selectedClass.sections || [] : []);
      if (!selectedClass || !selectedClass.sections.includes(filters.section)) {
        setFilters((prev) => ({ ...prev, section: '' }));
      }
    } else {
      setSections([]);
      setFilters((prev) => ({ ...prev, section: '' }));
    }
  }, [filters.class, classes]);

  useEffect(() => {
    let result = students;
    if (filters.name) {
      result = result.filter((student) =>
        student.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.admissionNo) {
      result = result.filter((student) =>
        student.admissionNo.toLowerCase().includes(filters.admissionNo.toLowerCase())
      );
    }
    if (filters.class) {
      result = result.filter((student) => student.class === filters.class);
    }
    if (filters.section) {
      result = result.filter((student) => student.section === filters.section);
    }
    setFilteredStudents(result);
  }, [filters, students]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      admissionNo: '',
      class: '',
      section: '',
    });
    setFilteredStudents(students);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">Students</h3>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Search Filters */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h4 className="text-md sm:text-lg font-semibold mb-4 text-gray-800">Search Students</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 text-sm sm:text-base mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded text-sm sm:text-base focus:ring-2 focus:ring-green-500"
              placeholder="e.g., John"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm sm:text-base mb-1">Admission No.</label>
            <input
              type="text"
              name="admissionNo"
              value={filters.admissionNo}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded text-sm sm:text-base focus:ring-2 focus:ring-green-500"
              placeholder="e.g., A001"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm sm:text-base mb-1">Class</label>
            <select
              name="class"
              value={filters.class}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded text-sm sm:text-base focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Classes</option>
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
              value={filters.section}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded text-sm sm:text-base focus:ring-2 focus:ring-green-500"
              disabled={!filters.class}
            >
              <option value="">All Sections</option>
              {sections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={clearFilters}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm sm:text-base"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Students Table */}
      {filteredStudents.length === 0 ? (
        <p className="text-gray-600">No students found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-left text-sm sm:text-base">Sr. No.</th>
                <th className="border p-2 text-left text-sm sm:text-base">Photo</th>
                <th className="border p-2 text-left text-sm sm:text-base">Admission No.</th>
                <th className="border p-2 text-left text-sm sm:text-base">Name</th>
                <th className="border p-2 text-left text-sm sm:text-base">Age</th>
                <th className="border p-2 text-left text-sm sm:text-base">Class</th>
                <th className="border p-2 text-left text-sm sm:text-base">Section</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr key={student.admissionNo} className="border">
                  <td className="p-2 border text-center text-sm sm:text-base">{index + 1}</td>
                  <td className="p-2 border flex justify-center items-center text-sm sm:text-base">
                    {student.photo ? (
                      <img
                        src={`http://localhost:8000${student.photo}`}
                        alt={`${student.name}'s photo`}
                        className="h-16 w-16 object-contain rounded"
                      />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="p-2 border text-center text-sm sm:text-base">{student.admissionNo}</td>
                  <td className="p-2 border text-center text-sm sm:text-base">{student.name}</td>
                  <td className="p-2 border text-center text-sm sm:text-base">{student.age || '-'}</td>
                  <td className="p-2 border text-center text-sm sm:text-base">{student.class || '-'}</td>
                  <td className="p-2 border text-center text-sm sm:text-base">{student.section || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 

export default ViewStudents; 