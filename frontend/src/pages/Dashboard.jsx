import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { getTasks } from '../services/taskApi';
import { useAuth } from '../hooks/useAuth';
import { CreateTaskModal, TaskDetailsModal } from '../components/TaskModals';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Statistics state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    running: 0,
    success: 0,
    failed: 0,
  });

  const fetchDashboardData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setIsRateLimited(false);
    }
    setError('');
    try {
      // Fetch tasks (unpaginated/large page to aggregate statistics)
      const res = await getTasks({ limit: 100 });
      if (res.success) {
        const fetchedTasks = res.data;
        setTasks(fetchedTasks);

        // Aggregate statistics
        const computedStats = fetchedTasks.reduce(
          (acc, task) => {
            acc.total += 1;
            if (task.status === 'PENDING') acc.pending += 1;
            else if (task.status === 'RUNNING') acc.running += 1;
            else if (task.status === 'SUCCESS') acc.success += 1;
            else if (task.status === 'FAILED') acc.failed += 1;
            return acc;
          },
          { total: 0, pending: 0, running: 0, success: 0, failed: 0 }
        );
        setStats(computedStats);
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setIsRateLimited(true);
        setError('Too many requests. Auto-refresh is paused. Click "Force Refresh Metrics" or try again later.');
      } else {
        setError(err.response?.data?.message || 'Failed to retrieve dashboard tasks.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDashboardData(false);
  }, []);

  // Performance optimized background polling: poll every 3 seconds only if any task is PENDING or RUNNING
  useEffect(() => {
    const hasActiveTasks = tasks.some(
      (task) => task.status === 'PENDING' || task.status === 'RUNNING'
    );

    if (!hasActiveTasks || isRateLimited) return;

    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [tasks, isRateLimited]);

  const statsCards = [
    { label: 'Total Tasks', value: stats.total, color: 'border-slate-800 bg-slate-900/40 text-slate-100' },
    { label: 'Pending', value: stats.pending, color: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400' },
    { label: 'Running', value: stats.running, color: 'border-blue-500/30 bg-blue-500/5 text-blue-400' },
    { label: 'Success', value: stats.success, color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' },
    { label: 'Failed', value: stats.failed, color: 'border-red-500/30 bg-red-500/5 text-red-400' },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user?.fullName || 'User'}! Monitor your system processing pipelines below.`}
        actions={
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Create Task
          </Button>
        }
      />

      {error && (
        <div className="mb-8 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="font-semibold">Error:</span>
          <span>{error}</span>
        </div>
      )}

      {loading && tasks.length === 0 ? (
        <Loader message="Synchronizing metrics..." />
      ) : (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {statsCards.map((card) => (
              <div
                key={card.label}
                className={`p-6 border rounded-2xl flex flex-col justify-between ${card.color} shadow-sm`}
              >
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{card.label}</span>
                <span className="text-3xl font-extrabold mt-3">{card.value}</span>
              </div>
            ))}
          </div>

          {/* Quick Info & Recent Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions Panel */}
            <div className="lg:col-span-1 space-y-4">
              <Card title="Quick Actions">
                <div className="space-y-3">
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-700 text-left transition-all duration-200 group"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">New Task Operation</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Submit strings for processing</p>
                    </div>
                    <span className="text-brand-400 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  <Button variant="secondary" className="w-full" onClick={() => fetchDashboardData(false)}>
                    Force Refresh Metrics
                  </Button>
                </div>
              </Card>
            </div>

            {/* Recent Tasks List */}
            <div className="lg:col-span-2">
              <Card title="Recent Task Pipelines">
                {tasks.length === 0 ? (
                  <EmptyState
                    title="No tasks submitted yet"
                    description="Queue your first task using the Create Task option above."
                    action={
                      <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
                        Create Task
                      </Button>
                    }
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase font-semibold">
                          <th className="py-3 px-2">Title</th>
                          <th className="py-3 px-2">Operation</th>
                          <th className="py-3 px-2">Status</th>
                          <th className="py-3 px-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.slice(0, 5).map((task) => (
                          <tr key={task._id} className="border-b border-slate-850 text-sm text-slate-300 hover:bg-slate-900/10">
                            <td className="py-3.5 px-2 font-medium max-w-[150px] truncate">{task.title}</td>
                            <td className="py-3.5 px-2 font-mono text-xs">{task.operationType}</td>
                            <td className="py-3.5 px-2">
                              <StatusBadge status={task.status} />
                            </td>
                            <td className="py-3.5 px-2 text-right">
                              <button
                                onClick={() => setSelectedTask(task)}
                                className="text-brand-400 hover:text-brand-300 text-xs font-semibold focus:outline-none"
                              >
                                View Logs
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Task Creation Modal */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchDashboardData(true)}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
