import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { getTasks } from '../services/taskApi';
import { CreateTaskModal, TaskDetailsModal, DeleteConfirmModal } from '../components/TaskModals';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [operationType, setOperationType] = useState('');
  const [sort, setSort] = useState('-createdAt');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const fetchTasksData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setIsRateLimited(false);
    }
    setError('');
    try {
      const queryParams = {
        page,
        limit,
        sort,
      };
      
      if (search.trim()) queryParams.search = search.trim();
      if (status) queryParams.status = status;
      if (operationType) queryParams.operationType = operationType;

      const res = await getTasks(queryParams);
      if (res.success) {
        setTasks(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotalItems(res.pagination.totalItems);
        }
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setIsRateLimited(true);
        setError('Too many requests. Auto-refresh is paused. Click the refresh button or try again later.');
      } else {
        setError(err.response?.data?.message || 'Failed to retrieve tasks catalog.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Re-fetch when filter options change
  useEffect(() => {
    fetchTasksData(false);
  }, [page, limit, status, operationType, sort]);

  // Performance optimized background polling: poll every 3 seconds only if any task on the page is PENDING or RUNNING
  useEffect(() => {
    const hasActiveTasks = tasks.some(
      (task) => task.status === 'PENDING' || task.status === 'RUNNING'
    );

    if (!hasActiveTasks || isRateLimited) return;

    const interval = setInterval(() => {
      fetchTasksData(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [tasks, isRateLimited]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTasksData(false);
  };

  const handleRefresh = () => {
    fetchTasksData(false);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Tasks"
        subtitle="Catalog and history of execution jobs."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleRefresh} disabled={loading}>
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
              </svg>
            </Button>
            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Create Task
            </Button>
          </div>
        }
      />

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="font-semibold">Error:</span>
          <span>{error}</span>
        </div>
      )}

      {/* Filters Card */}
      <Card className="mb-6">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Search Box */}
          <div className="md:col-span-4">
            <Input
              label="Search Title"
              id="search"
              placeholder="Type title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <label htmlFor="filter-status" className="block text-slate-300 text-xs font-medium mb-2">
              Status
            </label>
            <select
              id="filter-status"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              disabled={loading}
              className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="RUNNING">RUNNING</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          {/* Operation Filter */}
          <div className="md:col-span-2">
            <label htmlFor="filter-operation" className="block text-slate-300 text-xs font-medium mb-2">
              Operation
            </label>
            <select
              id="filter-operation"
              value={operationType}
              onChange={(e) => { setOperationType(e.target.value); setPage(1); }}
              disabled={loading}
              className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500"
            >
              <option value="">All Operations</option>
              <option value="UPPERCASE">UPPERCASE</option>
              <option value="LOWERCASE">LOWERCASE</option>
              <option value="REVERSE">REVERSE</option>
              <option value="WORD_COUNT">WORD_COUNT</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="md:col-span-2">
            <label htmlFor="filter-sort" className="block text-slate-300 text-xs font-medium mb-2">
              Sort By
            </label>
            <select
              id="filter-sort"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              disabled={loading}
              className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-2 flex gap-2">
            <Button type="submit" variant="primary" className="flex-1 py-2.5" disabled={loading}>
              Search
            </Button>
          </div>
        </form>
      </Card>

      {/* Task List */}
      <Card title="Task Directory" subtitle={`Found ${totalItems} task records.`}>
        {loading && tasks.length === 0 ? (
          <Loader message="Synchronizing tasks..." />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No tasks match criteria"
            description="Clear search queries or filters to see all tasks."
            action={
              <Button variant="outline" onClick={() => { setSearch(''); setStatus(''); setOperationType(''); setPage(1); }}>
                Clear Filters
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase font-semibold">
                    <th className="py-3 px-3">Title</th>
                    <th className="py-3 px-3">Operation</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Created At</th>
                    <th className="py-3 px-3">Completed At</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task._id} className="border-b border-slate-850 text-sm text-slate-300 hover:bg-slate-900/10">
                      <td className="py-4 px-3 font-semibold text-slate-200 truncate max-w-[200px]" title={task.title}>
                        {task.title}
                      </td>
                      <td className="py-4 px-3">
                        <span className="font-mono text-xs text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-850">
                          {task.operationType}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="py-4 px-3 text-xs text-slate-400">
                        {new Date(task.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-3 text-xs text-slate-400">
                        {task.completedAt ? new Date(task.completedAt).toLocaleString() : 'Processing'}
                      </td>
                      <td className="py-4 px-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setSelectedTask(task)}
                            className="text-brand-400 hover:text-brand-300 font-semibold text-xs focus:outline-none"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => setTaskToDelete(task._id)}
                            className="text-red-400 hover:text-red-300 font-semibold text-xs focus:outline-none"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-850">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Show</span>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2.5 py-1 focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>items per page</span>
              </div>

              <div className="flex items-center gap-4 justify-between sm:justify-end">
                <span className="text-xs text-slate-400">
                  Page <strong className="text-slate-200">{page}</strong> of <strong className="text-slate-200">{totalPages}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Create Modal */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchTasksData(true)}
      />

      {/* Details Modal */}
      <TaskDetailsModal
        isOpen={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={taskToDelete !== null}
        onClose={() => setTaskToDelete(null)}
        taskId={taskToDelete}
        onSuccess={() => fetchTasksData(true)}
      />
    </DashboardLayout>
  );
};

export default Tasks;
