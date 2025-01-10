import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTodoLists, createTodoList, addTask, updateTaskStatus } from '../../features/todos/todoSlice';
import { logout } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../context/DarkModeContext';

export default function TaskList() {
  const [newListName, setNewListName] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [activeListId, setActiveListId] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lists, status } = useSelector((state) => state.todos);
  const { user } = useSelector((state) => state.auth);
  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    dispatch(fetchTodoLists());
  }, [dispatch]);

  const handleCreateList = (e) => {
    e.preventDefault();
    if (newListName.trim()) {
      dispatch(createTodoList(newListName));
      setNewListName('');
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTaskText.trim() && activeListId) {
      dispatch(addTask({ listId: activeListId, text: newTaskText }));
      setNewTaskText('');
    }
  };

  const handleToggleTask = (listId, taskId, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    dispatch(updateTaskStatus({ listId, taskId, status: newStatus }));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-10 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Todo Lists
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`hidden sm:block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Welcome, {user?.name}!
              </span>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
                aria-label="Toggle dark mode"
              >
                {darkMode ? '🌞' : '🌙'}
              </button>
              <button
                onClick={handleLogout}
                className="btn btn-secondary text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Welcome Message */}
          <div className="sm:hidden mb-4">
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Welcome, {user?.name}!
            </p>
          </div>

          {/* Create new list form */}
          <form onSubmit={handleCreateList} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="New list name"
                className="input flex-grow dark:bg-gray-800 dark:text-white dark:border-gray-700"
              />
              <button type="submit" className="btn btn-primary w-full sm:w-auto">
                Create List
              </button>
            </div>
          </form>

          {/* Lists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <div
                key={list._id}
                className={`p-4 rounded-lg shadow-md ${
                  darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                }`}
              >
                <h2 className="text-xl font-semibold mb-4">{list.name}</h2>
                
                {/* Add task form */}
                <form onSubmit={handleAddTask} className="mb-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      onClick={() => setActiveListId(list._id)}
                      placeholder="New task"
                      className="input flex-grow dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                    <button
                      type="submit"
                      disabled={activeListId !== list._id}
                      className="btn btn-primary w-full sm:w-auto"
                    >
                      Add Task
                    </button>
                  </div>
                </form>

                {/* Tasks */}
                <ul className="space-y-2">
                  {list.tasks.map((task) => (
                    <li
                      key={task._id}
                      className={`flex items-center gap-2 p-2 rounded ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => handleToggleTask(list._id, task._id, task.status)}
                        className="h-5 w-5 rounded border-gray-300 dark:border-gray-600"
                      />
                      <span
                        className={`flex-grow ${
                          task.status === 'completed'
                            ? 'line-through text-gray-500 dark:text-gray-400'
                            : darkMode
                            ? 'text-white'
                            : 'text-gray-900'
                        }`}
                      >
                        {task.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
