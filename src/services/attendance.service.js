import { query, execute } from '../utils/db.js';
import { ApiError } from '../utils/ApiError.js';

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    employeeId: row.employee_id,
    workDate: row.work_date,
    checkIn: row.check_in,
    checkOut: row.check_out,
    status: row.status,
    notes: row.notes,
  };
}

export async function listAttendance({ employeeId, month, year, all, scopeEmployeeId }) {
  let sql = `
    SELECT a.*, e.first_name, e.last_name
    FROM attendance a
    INNER JOIN employees e ON e.id = a.employee_id
    WHERE 1=1
  `;
  const params = [];

  if (!all && scopeEmployeeId) {
    sql += ` AND a.employee_id = ?`;
    params.push(scopeEmployeeId);
  } else if (employeeId) {
    sql += ` AND a.employee_id = ?`;
    params.push(employeeId);
  }

  if (month && year) {
    sql += ` AND MONTH(a.work_date) = ? AND YEAR(a.work_date) = ?`;
    params.push(month, year);
  }

  sql += ` ORDER BY a.work_date DESC, a.id DESC`;

  const rows = await query(sql, params);
  return rows.map((r) => ({
    ...mapRow(r),
    employeeName: `${r.first_name} ${r.last_name}`,
  }));
}

export async function getAttendanceById(id) {
  const rows = await query(`SELECT * FROM attendance WHERE id = ?`, [id]);
  return mapRow(rows[0]);
}

export async function createAttendance(data) {
  try {
    const result = await execute(
      `INSERT INTO attendance (employee_id, work_date, check_in, check_out, status, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.employeeId,
        data.workDate,
        data.checkIn ?? null,
        data.checkOut ?? null,
        data.status ?? 'present',
        data.notes ?? null,
      ]
    );
    return getAttendanceById(result.insertId);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      throw ApiError.conflict('Attendance already exists for this employee and date');
    }
    throw e;
  }
}

export async function updateAttendance(id, data) {
  const existing = await getAttendanceById(id);
  if (!existing) {
    throw ApiError.notFound('Attendance record not found');
  }
  const fields = [];
  const values = [];
  const assign = (col, val) => {
    if (val !== undefined) {
      fields.push(`${col} = ?`);
      values.push(val);
    }
  };
  assign('work_date', data.workDate);
  assign('check_in', data.checkIn);
  assign('check_out', data.checkOut);
  assign('status', data.status);
  assign('notes', data.notes);

  if (!fields.length) {
    return existing;
  }
  values.push(id);
  await execute(`UPDATE attendance SET ${fields.join(', ')} WHERE id = ?`, values);
  return getAttendanceById(id);
}

export async function deleteAttendance(id) {
  const r = await execute(`DELETE FROM attendance WHERE id = ?`, [id]);
  if (!r.affectedRows) {
    throw ApiError.notFound('Attendance record not found');
  }
  return true;
}
