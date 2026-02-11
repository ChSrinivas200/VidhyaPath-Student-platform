import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import TaskCard from '../components/TaskCard'; // ✅ Uses the shared component with correct Focus logic
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/plannerService';

const StudyPlanner = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // New Task Form State
  const [newTask, setNewTask] = useState({
    title: '',
    subject: '',
    dueDate: new Date().toISOString().split('T')[0], //  Default today
    priority: 'do_first'
  });

  // 1. Load Tasks
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load tasks", error);
      setLoading(false);
    }
  };

  // 2. Action Handlers
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const created = await createTask(newTask);
      setTasks([...tasks, created]); // Add to list immediately
      setShowModal(false);
      setNewTask({ title: '', subject: '', dueDate: '', priority: 'do_first' }); // Reset
    } catch (error) {
      alert("Error creating task");
    }
  };

  const handleComplete = async (taskId) => {
    // Optimistic Update
    setTasks(tasks.map(t => t._id === taskId ? { ...t, isCompleted: true } : t));
    await updateTask(taskId, { isCompleted: true });
  };

  const handleDelete = async (taskId) => {
    if (window.confirm("Delete this task?")) {
      setTasks(tasks.filter(t => t._id !== taskId));
      await deleteTask(taskId);
    }
  };

  const handleUpdateNotes = async (taskId, notes) => {
    await updateTask(taskId, { notes });
  };

  // 3. Helper to Filter Columns
  const getTasksByPriority = (priority) => {
    return tasks.filter(t => t.priority === priority && !t.isCompleted);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Eisenhower Planner</h1>
          <p className="text-gray-500">Prioritize tasks by Urgency and Importance.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* The Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
        
        {/* Column 1: DO FIRST */}
        <div className="flex flex-col gap-3">
          <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-red-700 font-bold flex justify-between">
            🔥 Do First <span>{getTasksByPriority('do_first').length}</span>
          </div>
          {getTasksByPriority('do_first').map(task => (
             <TaskCard 
               key={task._id} 
               task={task} 
               onComplete={handleComplete} 
               onDelete={handleDelete} 
               onUpdateNotes={handleUpdateNotes} 
             />
          ))}
          {getTasksByPriority('do_first').length === 0 && (
             <div className="text-center p-4 border-2 border-dashed border-red-100 rounded-lg text-red-300 text-sm">No urgent tasks</div>
          )}
        </div>

        {/* Column 2: SCHEDULE */}
        <div className="flex flex-col gap-3">
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-blue-700 font-bold flex justify-between">
            🗓️ Schedule <span>{getTasksByPriority('schedule').length}</span>
          </div>
          {getTasksByPriority('schedule').map(task => (
             <TaskCard 
               key={task._id} 
               task={task} 
               onComplete={handleComplete} 
               onDelete={handleDelete} 
               onUpdateNotes={handleUpdateNotes} 
             />
          ))}
        </div>

        {/* Column 3: DELEGATE */}
        <div className="flex flex-col gap-3">
          <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg text-orange-700 font-bold flex justify-between">
            🤝 Delegate <span>{getTasksByPriority('delegate').length}</span>
          </div>
          {getTasksByPriority('delegate').map(task => (
             <TaskCard 
               key={task._id} 
               task={task} 
               onComplete={handleComplete} 
               onDelete={handleDelete} 
               onUpdateNotes={handleUpdateNotes} 
             />
          ))}
        </div>

        {/* Column 4: DELETE */}
        <div className="flex flex-col gap-3">
          <div className="bg-gray-100 border border-gray-200 p-3 rounded-lg text-gray-600 font-bold flex justify-between">
            🗑️ Eliminate <span>{getTasksByPriority('delete').length}</span>
          </div>
          {getTasksByPriority('delete').map(task => (
             <TaskCard 
               key={task._id} 
               task={task} 
               onComplete={handleComplete} 
               onDelete={handleDelete} 
               onUpdateNotes={handleUpdateNotes} 
             />
          ))}
        </div>

      </div>

      {/* --- MODAL FOR NEW TASK --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Add New Task</h2>
            <form onSubmit={handleCreateTask}>
              <input 
                type="text" 
                placeholder="Task Title" 
                className="w-full border p-2 rounded mb-3"
                value={newTask.title}
                onChange={e => setNewTask({...newTask, title: e.target.value})}
                required
              />
              <input 
                type="text" 
                placeholder="Subject (e.g. Math)" 
                className="w-full border p-2 rounded mb-3"
                value={newTask.subject}
                onChange={e => setNewTask({...newTask, subject: e.target.value})}
                required
              />
              <div className="flex gap-2 mb-3">
                <input 
                  type="date" 
                  className="w-full border p-2 rounded"
                  value={newTask.dueDate}
                  onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                />
                <select 
                  className="w-full border p-2 rounded"
                  value={newTask.priority}
                  onChange={e => setNewTask({...newTask, priority: e.target.value})}
                >
                  <option value="do_first">🔥 Do First</option>
                  <option value="schedule">🗓️ Schedule</option>
                  <option value="delegate">🤝 Delegate</option>
                  <option value="delete">🗑️ Eliminate</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudyPlanner;