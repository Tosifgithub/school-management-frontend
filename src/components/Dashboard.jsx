import { useState, useEffect, useRef, useContext } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/NewAuthContext';
import AddStudentForm from './AddStudentForm';
import ViewStudents from './ViewStudents';
import Home from './Home';
import logo from '../assets/images/logo.png';
import ManageClasses from './ManageClasses';
import ManageTeachers from './ManageTeachers';

const API_URL = 'http://localhost:8000/api/admin';

function Dashboard() {
  const { auth, logout } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [sessionName, setSessionName] = useState('Loading...');
  const [isBackOfficeOpen, setIsBackOfficeOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const backOfficeDropdownRef = useRef(null);
  const manageDropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch students');
      }
    }
  };

  const fetchSessionName = async () => {
    try {
      const res = await axios.get(`${API_URL}/sessions`);
      const session = res.data.find((s) => s.id === auth.admin.currentSessionId);
      setSessionName(session ? session.name : 'Unknown');
    } catch (err) {
      setSessionName('Unknown');
      setError(err.response?.data?.error || 'Failed to fetch session name');
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchSessionName();
  }, [auth.admin.currentSessionId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        backOfficeDropdownRef.current &&
        !backOfficeDropdownRef.current.contains(event.target)
      ) {
        setIsBackOfficeOpen(false);
      }
      if (
        manageDropdownRef.current &&
        !manageDropdownRef.current.contains(event.target)
      ) {
        setIsManageOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleBackOfficeDropdown = () => {
    setIsBackOfficeOpen(!isBackOfficeOpen);
    setIsManageOpen(false); // Close other dropdown
  };

  const toggleManageDropdown = () => {
    setIsManageOpen(!isManageOpen);
    setIsBackOfficeOpen(false); // Close other dropdown
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
    if (isBackOfficeOpen) setIsBackOfficeOpen(false);
    if (isManageOpen) setIsManageOpen(false);
  };

  const navItems = [
    { name: 'Home', path: '' },
    { name: 'Back Office', path: 'back-office', hasDropdown: true },
    { name: 'Manage', path: 'manage', hasDropdown: true },
    { name: 'Fees', path: 'fees' },
    { name: 'Reports', path: 'reports' },
  ];

  const backOfficeDropdownItems = [
    { name: 'Add New Students', path: 'back-office/add-student' },
    { name: 'View Students', path: 'back-office/view-students' },
  ];

  const manageDropdownItems = [
    { name: 'Manage Classes', path: 'manage/classes' },
    { name: 'Manage Teachers', path: 'manage/teachers' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-center sm:justify-start">
            <img
              src={logo}
              alt="School Logo"
              className="h-12 w-12 sm:h-16 sm:w-16 mr-0 sm:mr-4"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center my-2 sm:my-0 sm:flex-grow">
            Springfield High School
          </h1>
          <div className="flex items-center justify-center sm:justify-end space-x-2 sm:space-x-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 text-center">
              Welcome, {auth.admin.email} (Session: {sessionName})
            </h2>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded hover:bg-red-600 text-sm sm:text-base"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <button
              onClick={toggleNav}
              className="md:hidden text-white focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isNavOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
            <ul
              className={`${
                isNavOpen ? 'flex' : 'hidden'
              } md:flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto transition-all duration-300`}
            >
              {navItems.map((item) => (
                <li
                  key={item.name}
                  className="relative"
                  ref={item.hasDropdown && item.name === 'Back Office' ? backOfficeDropdownRef : item.hasDropdown ? manageDropdownRef : null}
                >
                  {item.hasDropdown ? (
                    <>
                      <button
                        onClick={item.name === 'Back Office' ? toggleBackOfficeDropdown : toggleManageDropdown}
                        className={`inline-flex items-center text-white px-3 py-2 rounded-md text-sm font-medium w-full md:w-auto text-left ${
                          (item.name === 'Back Office' && isBackOfficeOpen) || (item.name === 'Manage' && isManageOpen)
                            ? 'bg-gray-900'
                            : 'hover:bg-gray-700'
                        }`}
                      >
                        {item.name}
                        <span className="ml-1 text-white">▼</span>
                      </button>
                      {(item.name === 'Back Office' && isBackOfficeOpen) || (item.name === 'Manage' && isManageOpen) ? (
                        <ul className="md:absolute md:left-0 md:mt-2 w-full md:w-48 bg-white rounded-md shadow-lg z-10 mt-1">
                          {(item.name === 'Back Office' ? backOfficeDropdownItems : manageDropdownItems).map((dropdownItem) => (
                            <li key={dropdownItem.name}>
                              <NavLink
                                to={`/dashboard/${dropdownItem.path}`}
                                className={({ isActive }) =>
                                  `block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                                    isActive ? 'bg-gray-100 font-semibold' : ''
                                  }`
                                }
                                onClick={() => {
                                  setIsBackOfficeOpen(false);
                                  setIsManageOpen(false);
                                  setIsNavOpen(false);
                                }}
                              >
                                {dropdownItem.name}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </>
                  ) : (
                    <NavLink
                      to={`/dashboard/${item.path}`}
                      end={item.path === ''}
                      className={({ isActive }) =>
                        `inline-flex items-center text-white px-3 py-2 rounded-md text-sm font-medium w-full md:w-auto ${
                          isActive ? 'bg-gray-900' : 'hover:bg-gray-700'
                        }`
                      }
                      onClick={() => setIsNavOpen(false)}
                    >
                      {item.name}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      <div className="max-w-full sm:max-w-4xl mx-auto px-4 py-4 sm:p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/back-office" element={<div>Back Office Dashboard</div>} />
          <Route
            path="/back-office/add-student"
            element={<AddStudentForm onAddStudent={fetchStudents} />}
          />
          <Route
            path="/back-office/view-students"
            element={<ViewStudents />}
          />
          <Route path="/manage" element={<div>Manage Dashboard</div>} />
          <Route path="/manage/classes" element={<ManageClasses/>} />
          <Route path="/manage/teachers" element={<ManageTeachers/>} />
          <Route path="/fees" element={<div>Fees (Coming Soon)</div>} />
          <Route path="/reports" element={<div>Reports (Coming Soon)</div>} />
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;