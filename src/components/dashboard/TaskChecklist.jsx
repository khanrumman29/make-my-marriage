import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { formatDate } from '../../utils/formatters';

export function TaskChecklist({ initialTasks = [] }) {
  const [tasks, setTasks] = useState(initialTasks);

  useEffect(() => {
    if (initialTasks && initialTasks.length > 0) {
      setTasks(initialTasks);
    }
  }, [initialTasks]);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'done' || t.status === 'completed' ? 'todo' : 'done' }
          : t
      )
    );
  };

  return (
    <Card>
      <CardHeader
        title="Your Next Steps"
        subtitle="Key planning tasks for the wedding"
      />

      <div className="space-y-2.5">
        {tasks.length === 0 ? (
          <p className="text-xs text-muted text-center py-4">No pending tasks.</p>
        ) : (
          tasks.slice(0, 5).map((task) => {
            const isDone = task.status === 'done' || task.status === 'completed';
            return (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-3 rounded-control border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  isDone
                    ? 'bg-surface-soft/40 border-border/50 opacity-75'
                    : 'bg-surface hover:bg-canvas border-border'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-forest shrink-0 focus:outline-none"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted hover:text-forest" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs sm:text-sm font-medium leading-snug ${
                      isDone ? 'line-through text-muted' : 'text-ink'
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-muted">
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gold" />
                        Due {formatDate(task.dueDate)}
                      </span>
                    )}
                    {task.functionName && <span>• {task.functionName}</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
