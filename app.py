import os
import sqlite3
from io import BytesIO
from flask import (
    Flask, render_template, request, redirect, url_for, flash, send_file
)
import pandas as pd

app = Flask(__name__)
app.secret_key = 'maktab_boshqaruv_secret_key_2026'

DATABASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database.db')


# ─── Database helpers ───────────────────────────────────────────────

def get_db():
    """Return a database connection with Row factory."""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """Create tables if they don't exist."""
    conn = get_db()
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS schools (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            address TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            position TEXT NOT NULL,
            phone TEXT NOT NULL,
            school_id INTEGER NOT NULL,
            FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
        );
    ''')
    conn.commit()
    conn.close()


# ─── Dashboard ──────────────────────────────────────────────────────

@app.route('/')
def index():
    conn = get_db()
    schools = conn.execute('''
        SELECT s.*, COUNT(e.id) AS employee_count
        FROM schools s
        LEFT JOIN employees e ON e.school_id = s.id
        GROUP BY s.id
        ORDER BY s.name
    ''').fetchall()
    total_schools = len(schools)
    total_employees = conn.execute('SELECT COUNT(*) FROM employees').fetchone()[0]
    conn.close()
    return render_template('index.html',
                           schools=schools,
                           total_schools=total_schools,
                           total_employees=total_employees)


# ─── School CRUD ────────────────────────────────────────────────────

@app.route('/school/add', methods=['GET', 'POST'])
def add_school():
    if request.method == 'POST':
        name = request.form['name'].strip()
        address = request.form['address'].strip()
        if not name or not address:
            flash('Barcha maydonlarni to\'ldiring!', 'danger')
            return redirect(url_for('add_school'))
        conn = get_db()
        conn.execute('INSERT INTO schools (name, address) VALUES (?, ?)', (name, address))
        conn.commit()
        conn.close()
        flash('Maktab muvaffaqiyatli qo\'shildi!', 'success')
        return redirect(url_for('index'))
    return render_template('school_form.html', school=None)


@app.route('/school/<int:school_id>')
def school_detail(school_id):
    conn = get_db()
    school = conn.execute('SELECT * FROM schools WHERE id = ?', (school_id,)).fetchone()
    if not school:
        flash('Maktab topilmadi!', 'danger')
        conn.close()
        return redirect(url_for('index'))
    employees = conn.execute(
        'SELECT * FROM employees WHERE school_id = ? ORDER BY last_name, first_name',
        (school_id,)
    ).fetchall()
    conn.close()
    return render_template('school_detail.html', school=school, employees=employees)


@app.route('/school/<int:school_id>/edit', methods=['GET', 'POST'])
def edit_school(school_id):
    conn = get_db()
    school = conn.execute('SELECT * FROM schools WHERE id = ?', (school_id,)).fetchone()
    if not school:
        flash('Maktab topilmadi!', 'danger')
        conn.close()
        return redirect(url_for('index'))
    if request.method == 'POST':
        name = request.form['name'].strip()
        address = request.form['address'].strip()
        if not name or not address:
            flash('Barcha maydonlarni to\'ldiring!', 'danger')
            conn.close()
            return redirect(url_for('edit_school', school_id=school_id))
        conn.execute('UPDATE schools SET name = ?, address = ? WHERE id = ?',
                     (name, address, school_id))
        conn.commit()
        conn.close()
        flash('Maktab muvaffaqiyatli yangilandi!', 'success')
        return redirect(url_for('school_detail', school_id=school_id))
    conn.close()
    return render_template('school_form.html', school=school)


@app.route('/school/<int:school_id>/delete', methods=['POST'])
def delete_school(school_id):
    conn = get_db()
    conn.execute('DELETE FROM schools WHERE id = ?', (school_id,))
    conn.commit()
    conn.close()
    flash('Maktab o\'chirildi!', 'warning')
    return redirect(url_for('index'))


# ─── Employee CRUD ──────────────────────────────────────────────────

@app.route('/school/<int:school_id>/employee/add', methods=['GET', 'POST'])
def add_employee(school_id):
    conn = get_db()
    school = conn.execute('SELECT * FROM schools WHERE id = ?', (school_id,)).fetchone()
    if not school:
        flash('Maktab topilmadi!', 'danger')
        conn.close()
        return redirect(url_for('index'))
    if request.method == 'POST':
        first_name = request.form['first_name'].strip()
        last_name = request.form['last_name'].strip()
        position = request.form['position'].strip()
        phone = request.form['phone'].strip()
        if not all([first_name, last_name, position, phone]):
            flash('Barcha maydonlarni to\'ldiring!', 'danger')
            conn.close()
            return redirect(url_for('add_employee', school_id=school_id))
        conn.execute(
            'INSERT INTO employees (first_name, last_name, position, phone, school_id) '
            'VALUES (?, ?, ?, ?, ?)',
            (first_name, last_name, position, phone, school_id)
        )
        conn.commit()
        conn.close()
        flash('Xodim muvaffaqiyatli qo\'shildi!', 'success')
        return redirect(url_for('school_detail', school_id=school_id))
    conn.close()
    return render_template('employee_form.html', school=school, employee=None)


@app.route('/employee/<int:employee_id>/edit', methods=['GET', 'POST'])
def edit_employee(employee_id):
    conn = get_db()
    employee = conn.execute('SELECT * FROM employees WHERE id = ?', (employee_id,)).fetchone()
    if not employee:
        flash('Xodim topilmadi!', 'danger')
        conn.close()
        return redirect(url_for('index'))
    school = conn.execute('SELECT * FROM schools WHERE id = ?',
                          (employee['school_id'],)).fetchone()
    if request.method == 'POST':
        first_name = request.form['first_name'].strip()
        last_name = request.form['last_name'].strip()
        position = request.form['position'].strip()
        phone = request.form['phone'].strip()
        if not all([first_name, last_name, position, phone]):
            flash('Barcha maydonlarni to\'ldiring!', 'danger')
            conn.close()
            return redirect(url_for('edit_employee', employee_id=employee_id))
        conn.execute(
            'UPDATE employees SET first_name=?, last_name=?, position=?, phone=? WHERE id=?',
            (first_name, last_name, position, phone, employee_id)
        )
        conn.commit()
        conn.close()
        flash('Xodim muvaffaqiyatli yangilandi!', 'success')
        return redirect(url_for('school_detail', school_id=employee['school_id']))
    conn.close()
    return render_template('employee_form.html', school=school, employee=employee)


@app.route('/employee/<int:employee_id>/delete', methods=['POST'])
def delete_employee(employee_id):
    conn = get_db()
    employee = conn.execute('SELECT * FROM employees WHERE id = ?', (employee_id,)).fetchone()
    if not employee:
        flash('Xodim topilmadi!', 'danger')
        conn.close()
        return redirect(url_for('index'))
    school_id = employee['school_id']
    conn.execute('DELETE FROM employees WHERE id = ?', (employee_id,))
    conn.commit()
    conn.close()
    flash('Xodim o\'chirildi!', 'warning')
    return redirect(url_for('school_detail', school_id=school_id))


# ─── Excel Export ───────────────────────────────────────────────────

@app.route('/export/all')
def export_all():
    conn = get_db()
    schools_df = pd.read_sql_query('SELECT id, name, address FROM schools ORDER BY name', conn)
    employees_df = pd.read_sql_query('''
        SELECT e.id, e.first_name AS "Ism", e.last_name AS "Familiya",
               e.position AS "Lavozim", e.phone AS "Telefon",
               s.name AS "Maktab"
        FROM employees e
        JOIN schools s ON s.id = e.school_id
        ORDER BY s.name, e.last_name
    ''', conn)
    conn.close()

    schools_df.columns = ['ID', 'Maktab nomi', 'Manzil']
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        schools_df.to_excel(writer, sheet_name='Maktablar', index=False)
        employees_df.to_excel(writer, sheet_name='Xodimlar', index=False)
    output.seek(0)
    return send_file(output,
                     mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                     as_attachment=True,
                     download_name='barcha_malumotlar.xlsx')


@app.route('/export/school/<int:school_id>')
def export_school(school_id):
    conn = get_db()
    school = conn.execute('SELECT * FROM schools WHERE id = ?', (school_id,)).fetchone()
    if not school:
        flash('Maktab topilmadi!', 'danger')
        conn.close()
        return redirect(url_for('index'))
    employees_df = pd.read_sql_query('''
        SELECT e.id AS "ID", e.first_name AS "Ism", e.last_name AS "Familiya",
               e.position AS "Lavozim", e.phone AS "Telefon"
        FROM employees e
        WHERE e.school_id = ?
        ORDER BY e.last_name, e.first_name
    ''', conn, params=(school_id,))
    conn.close()

    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        employees_df.to_excel(writer, sheet_name=school['name'][:31], index=False)
    output.seek(0)
    filename = f"{school['name']}_xodimlar.xlsx".replace(' ', '_')
    return send_file(output,
                     mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                     as_attachment=True,
                     download_name=filename)


# ─── Run ────────────────────────────────────────────────────────────

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
