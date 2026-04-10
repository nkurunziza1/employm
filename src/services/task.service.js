import { query, execute } from '../utils/db.js';
import { ApiError } from '../utils/ApiError.js';

function mapTask(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    assignedTo: row.assigned_to,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

/**
 * @param {object} opts
 * @param {boolean} opts.all - if true, no employee filter
 * @param {number|null} opts.employeeId - current user's employee id for scoped view
 */
export async function listTasks({ all, employeeId }) {
  if (!all && !employeeId) {
    return [];
  }
  let sql = `
    SELECT t.* FROM tasks t
  `;
  const params = [];
  if (!all && employeeId) {
    sql += ` WHERE t.assigned_to = ? OR t.created_by = ?`;
    params.push(employeeId, employeeId);
  }
  sql += ` ORDER BY t.due_date IS NULL, t.due_date ASC, t.id DESC`;
  const rows = await query(sql, params);
  return rows.map(mapTask);
}

export async function getTaskById(id) {
  const rows = await query(`SELECT * FROM tasks WHERE id = ?`, [id]);
  return mapTask(rows[0]);
}

export async function createTask(data, createdByEmployeeId) {
  const result = await execute(
    `INSERT INTO tasks (title, description, status, priority, due_date, assigned_to, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.title,
      data.description ?? null,
      data.status ?? 'pending',
      data.priority ?? 'medium',
      data.dueDate ?? null,
      data.assignedTo ?? null,
      createdByEmployeeId ?? null,
    ]
  );
  return getTaskById(result.insertId);
}

export async function updateTask(id, data) {
  const existing = await getTaskById(id);
  if (!existing) {
    throw ApiError.notFound('Task not found');
  }
  const fields = [];
  const values = [];
  const assign = (col, val) => {
    if (val !== undefined) {
      fields.push(`${col} = ?`);
      values.push(val);
    }
  };
  assign('title', data.title);
  assign('description', data.description);
  assign('status', data.status);
  assign('priority', data.priority);
  assign('due_date', data.dueDate);
  assign('assigned_to', data.assignedTo);

  if (!fields.length) {
    return existing;
  }
  values.push(id);
  await execute(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
  return getTaskById(id);
}

export async function deleteTask(id) {
  const r = await execute(`DELETE FROM tasks WHERE id = ?`, [id]);
  if (!r.affectedRows) {
    throw ApiError.notFound('Task not found');
  }
  return true;
}
