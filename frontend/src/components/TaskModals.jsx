import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import StatusBadge from './StatusBadge';
import { createTask, deleteTask } from '../services/taskApi';

/**
 * Modal to create a new task.
 */
export const CreateTaskModal = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [inputText, setInputText] = useState('');
  const [operationType, setOperationType] = useState('UPPERCASE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!title || !inputText) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      await createTask({ title, inputText, operationType });
      setTitle('');
      setInputText('');
      setOperationType('UPPERCASE');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit task. Make sure database and Redis queue services are reachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Background Task">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2.5 rounded-lg">
            {error}
          </div>
        )}

        <Input
          label="Task Title"
          id="task-title"
          placeholder="e.g. Process text payload"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          required
        />

        <div>
          <label htmlFor="operation-type" className="block text-slate-350 text-sm font-medium mb-2">
            Operation Type
          </label>
          <select
            id="operation-type"
            value={operationType}
            onChange={(e) => setOperationType(e.target.value)}
            disabled={loading}
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all duration-200 cursor-pointer"
          >
            <option value="UPPERCASE">Uppercase Converter</option>
            <option value="LOWERCASE">Lowercase Converter</option>
            <option value="REVERSE">Reverse Characters</option>
            <option value="WORD_COUNT">Word Counter</option>
          </select>
        </div>

        <div>
          <label htmlFor="input-text" className="block text-slate-350 text-sm font-medium mb-2">
            Input Text
          </label>
          <textarea
            id="input-text"
            rows={5}
            placeholder="Type or paste payload data here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            required
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all duration-200"
          ></textarea>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-850">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Enqueue Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

/**
 * Modal to display task details and logs.
 */
export const TaskDetailsModal = ({ isOpen, onClose, task }) => {
  if (!task) return null;

  // Calculate execution duration
  const getExecutionTime = () => {
    if (!task.startedAt || !task.completedAt) return null;
    const start = new Date(task.startedAt);
    const end = new Date(task.completedAt);
    const diffMs = end - start;
    return `${(diffMs / 1000).toFixed(2)}s`;
  };

  const execTime = getExecutionTime();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Task Execution details: ${task.title}`} className="max-w-2xl">
      <div className="space-y-6 text-sm text-slate-300">
        
        {/* Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-850">
          <div>
            <span className="text-slate-500 text-xs font-semibold block uppercase">Status</span>
            <div className="mt-1">
              <StatusBadge status={task.status} />
            </div>
          </div>

          <div>
            <span className="text-slate-500 text-xs font-semibold block uppercase">Operation</span>
            <span className="inline-block mt-1.5 font-mono text-slate-200 font-semibold text-xs">{task.operationType}</span>
          </div>

          <div>
            <span className="text-slate-500 text-xs font-semibold block uppercase">Execution Time</span>
            <span className="inline-block mt-1.5 text-slate-200 font-medium">
              {execTime ? execTime : task.status === 'RUNNING' ? 'Running...' : 'Pending...'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 text-xs font-semibold block uppercase">Completed At</span>
            <span className="inline-block mt-1.5 text-slate-200 text-xs">
              {task.completedAt ? new Date(task.completedAt).toLocaleTimeString() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Inputs & Outputs */}
        <div className="space-y-4">
          <div>
            <h4 className="text-slate-250 font-bold mb-1.5">Original Text</h4>
            <div className="p-4 rounded-lg bg-slate-950 text-slate-300 font-mono text-xs break-all max-h-40 overflow-y-auto border border-slate-850">
              {task.inputText}
            </div>
          </div>

          {task.status === 'SUCCESS' && (
            <div>
              <h4 className="text-slate-250 font-bold mb-1.5">Processed Result</h4>
              <div className="p-4 rounded-lg bg-slate-950/80 text-emerald-300 font-mono text-xs break-all border border-emerald-500/10 max-h-40 overflow-y-auto">
                {task.result}
              </div>
            </div>
          )}

          {task.status === 'FAILED' && (
            <div>
              <h4 className="text-red-400 font-bold mb-1.5">Failure Cause</h4>
              <div className="p-4 rounded-lg bg-red-950/15 text-red-400 font-mono text-xs border border-red-500/20">
                {task.errorMessage || 'Unknown system error occurred during execution.'}
              </div>
            </div>
          )}
        </div>

        {/* Logs */}
        <div>
          <h4 className="text-slate-250 font-bold mb-1.5">Execution Trace Logs</h4>
          <div className="p-4 rounded-lg bg-slate-950 text-slate-400 font-mono text-xs max-h-48 overflow-y-auto border border-slate-850 space-y-1">
            {task.executionLogs && task.executionLogs.length > 0 ? (
              task.executionLogs.map((log, index) => (
                <div key={index} className="leading-relaxed py-0.5 border-b border-slate-900/50 last:border-b-0">
                  {log}
                </div>
              ))
            ) : (
              <span className="italic text-slate-600">No trace logs recorded yet.</span>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-850">
          <Button variant="secondary" onClick={onClose}>
            Close Details
          </Button>
        </div>
      </div>
    </Modal>
  );
};

/**
 * Modal to confirm job deletion.
 */
export const DeleteConfirmModal = ({ isOpen, onClose, taskId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await deleteTask(taskId);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
      <div className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2.5 rounded-lg">
            {error}
          </div>
        )}
        
        <p className="text-slate-300 text-sm">
          Are you sure you want to permanently delete this task record? This action cannot be undone and will remove all execution logs and output data from the database.
        </p>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-850">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={loading}>
            Delete Record
          </Button>
        </div>
      </div>
    </Modal>
  );
};
