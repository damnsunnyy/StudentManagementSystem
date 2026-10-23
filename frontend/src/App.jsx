import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const blank = { name: '', email: '', course: '', age: '', studentId: '', department: '', phone: '', year: '1', semester: '1', status: 'Active', attendance: '0', feeStatus: 'Due' }
const navItems = [['Overview', '◫'], ['Students', '♧']]

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Request failed')
  return data
}

function App() {
  const [students, setStudents] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0, departments: 0, feeDue: 0, averageAttendance: 0 })
  const [page, setPage] = useState('Overview')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ department: '', status: '', feeStatus: '' })
  const [sort, setSort] = useState('newest')
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      Object.entries(filters).forEach(([key, value]) => value && params.set(key, value))
      const [rows, summary] = await Promise.all([request(`/students?${params}`), request('/dashboard')])
      setStudents(rows); setStats(summary); setError('')
    } catch (err) { setError(err.message.includes('fetch') ? 'Can’t reach the API. Start the backend and MongoDB, then refresh.' : err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [search, filters.department, filters.status, filters.feeStatus])

  const departments = useMemo(() => [...new Set(students.map((student) => student.department).filter(Boolean))].sort(), [students])
  const sortedStudents = useMemo(() => [...students].sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'attendance' ? b.attendance - a.attendance : new Date(b.createdAt) - new Date(a.createdAt)), [students, sort])
  const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  const tell = (message) => { setNotice(message); window.setTimeout(() => setNotice(''), 3000) }
  function openCreate() { setEditing(null); setForm(blank); setError(''); setModalOpen(true) }
  function openEdit(student) { setEditing(student._id); setForm(Object.fromEntries(Object.keys(blank).map((key) => [key, String(student[key] ?? blank[key])] ))); setError(''); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null); setForm(blank) }
  async function saveStudent(event) {
    event.preventDefault(); setError('')
    try {
      const payload = { ...form, studentId: form.studentId.trim() || undefined, age: Number(form.age), year: Number(form.year), semester: Number(form.semester), attendance: Number(form.attendance) }
      await request(editing ? `/students/${editing}` : '/students', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(payload) })
      closeModal(); tell(editing ? 'Student profile updated.' : 'Student enrolled successfully.'); load()
    } catch (err) { setError(err.message) }
  }
  async function deleteStudent(student) {
    if (!window.confirm(`Remove ${student.name} from the student register?`)) return
    try { await request(`/students/${student._id}`, { method: 'DELETE' }); tell('Student record removed.'); load() }
    catch (err) { setError(err.message) }
  }
  function exportCsv() {
    const fields = ['studentId', 'name', 'email', 'phone', 'course', 'department', 'year', 'semester', 'status', 'attendance', 'feeStatus']
    const csv = [fields.join(','), ...sortedStudents.map((student) => fields.map((key) => `"${String(student[key] ?? '').replaceAll('"', '""')}"`).join(','))].join('\n')
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = 'college-students.csv'; link.click(); URL.revokeObjectURL(link.href)
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#top"><span className="brand-mark">⌂</span><span>evergreen<span className="brand-dot">.</span><small>COLLEGE PORTAL</small></span></a>
      <div className="side-label">CAMPUS</div>
      <nav>{navItems.map(([label, icon]) => <button key={label} className={`nav-item ${page === label ? 'active' : ''}`} onClick={() => setPage(label)}><span className="nav-icon">{icon}</span>{label}{label === 'Students' && <span className="nav-count">{stats.total}</span>}</button>)}</nav>
      <div className="side-label section-label">ACADEMICS</div>
      <button className="nav-item" onClick={() => { setPage('Students'); setFilters({ ...filters, feeStatus: 'Due' }) }}><span className="nav-icon">◷</span>Fee follow-up</button>
      <button className="nav-item" onClick={() => { setPage('Students'); setFilters({ ...filters, status: 'Active' }) }}><span className="nav-icon">▤</span>Active enrollment</button>
      <div className="side-footer"><span className="help-icon">✳</span><div><strong>Campus overview</strong><span>Keep your records in sync</span></div></div>
      <div className="profile"><div className="profile-avatar">AD</div><div className="profile-copy"><strong>Campus Admin</strong><span>Administrator</span></div><span className="profile-dots">···</span></div>
    </aside>
    <main className="main-content" id="top">
      <header className="topbar"><div className="breadcrumb">College workspace <span>/</span> <strong>{page}</strong></div><div className="top-actions"><span className="live-status"><i /> Campus data</span><div className="top-avatar">AD</div></div></header>
      <section className="page-wrap">
        <div className="welcome-banner"><div><div className="eyebrow">CAMPUS MANAGEMENT · 2026–27</div><h1>{page === 'Overview' ? 'A thriving campus starts here.' : 'Student register'}</h1><p>{page === 'Overview' ? 'Your college, at a glance. Here’s what’s happening today.' : 'Keep student profiles, academic progress and fee status in one place.'}</p></div><div className="banner-art"><span>✳</span><i>✦</i><b>❋</b></div></div>
        <div className="section-tabs">{navItems.map(([label]) => <button className={page === label ? 'selected' : ''} key={label} onClick={() => setPage(label)}>{label}</button>)}</div>
        <div className="stats-grid">
          <article className="stat-card"><div className="stat-top"><span>Enrolled students</span><span className="stat-icon">♧</span></div><div className="stat-number">{stats.total}<small>records</small></div><div className="stat-note">Across all departments</div></article>
          <article className="stat-card"><div className="stat-top"><span>Active enrollment</span><span className="stat-icon">↗</span></div><div className="stat-number">{stats.active}<small>students</small></div><div className="stat-note">Currently studying</div></article>
          <article className="stat-card"><div className="stat-top"><span>Departments</span><span className="stat-icon">▤</span></div><div className="stat-number">{stats.departments}<small>departments</small></div><div className="stat-note">Represented in the register</div></article>
          <article className="stat-card"><div className="stat-top"><span>Average attendance</span><span className="stat-icon">◷</span></div><div className="stat-number">{stats.averageAttendance}%<small>average</small></div><div className="stat-note">Across student records</div></article>
        </div>
        <section className="directory-card">
          <div className="directory-heading"><div><div className="eyebrow">PEOPLE & ACADEMICS</div><h2>{page === 'Overview' ? 'Recently enrolled' : 'All students'} <span className="count-pill">{students.length}</span></h2><p>Student profiles, program details and academic standing.</p></div><div className="heading-actions"><button className="export-button" onClick={exportCsv}>↓ Export CSV</button><button className="primary-button" onClick={openCreate}><span>＋</span> Enroll student</button></div></div>
          <div className="table-tools"><label className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, ID, email or department" /></label><div className="filter-controls"><label className="filter-box"><select aria-label="Filter department" value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}><option value="">All departments</option>{departments.map((name) => <option key={name}>{name}</option>)}</select></label><label className="filter-box"><select aria-label="Filter status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">All statuses</option><option>Active</option><option>On leave</option><option>Graduated</option></select></label><label className="filter-box"><select aria-label="Sort students" value={sort} onChange={(e) => setSort(e.target.value)}><option value="newest">Recently added</option><option value="name">Name A–Z</option><option value="attendance">Attendance</option></select></label></div></div>
          {error && !modalOpen && <div className="inline-error">{error} <button onClick={load}>Retry</button></div>}
          <div className="table-scroll"><table><thead><tr><th>STUDENT</th><th>PROGRAM / DEPARTMENT</th><th>YEAR</th><th>ATTENDANCE</th><th>FEES</th><th>STATUS</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
            {loading ? <tr><td colSpan="7" className="table-message">Loading campus records…</td></tr> : sortedStudents.length === 0 ? <tr><td colSpan="7" className="table-message"><span className="empty-icon">♧</span><strong>{search || Object.values(filters).some(Boolean) ? 'No matching records' : 'Your campus register is ready'}</strong><span>{search || Object.values(filters).some(Boolean) ? 'Adjust your search or filters.' : 'Enroll your first student to get started.'}</span>{!search && <button className="text-action" onClick={openCreate}>＋ Enroll a student</button>}</td></tr> : sortedStudents.map((student, index) => <tr key={student._id}><td><div className="student-cell"><div className={`student-avatar tone-${index % 5}`}>{initials(student.name)}</div><div><strong>{student.name}</strong><span>{student.studentId || student.email}</span></div></div></td><td><strong className="course-name">{student.course}</strong><span className="department-name">{student.department || 'General'}</span></td><td className="year-cell">Year {student.year || 1}<span>Semester {student.semester || 1}</span></td><td><div className="attendance-cell"><div className="progress-track"><i style={{ width: `${student.attendance || 0}%` }} /></div><span>{student.attendance || 0}%</span></div></td><td><span className={`status-pill fee-${(student.feeStatus || 'Due').toLowerCase()}`}>{student.feeStatus || 'Due'}</span></td><td><span className={`status-pill state-${(student.status || 'Active').toLowerCase().replace(' ', '-')}`}>{student.status || 'Active'}</span></td><td><div className="row-actions"><button onClick={() => openEdit(student)} aria-label={`Edit ${student.name}`}>↗</button><button onClick={() => deleteStudent(student)} aria-label={`Delete ${student.name}`}>⌫</button></div></td></tr>)}
          </tbody></table></div>
          <div className="table-footer"><span>Showing <strong>{students.length}</strong> {students.length === 1 ? 'student' : 'students'}</span><span>Updated live <i className="footer-dot" /></span></div>
        </section>
        <footer className="page-footer"><span>© 2026 Evergreen College Portal</span><span>Growing together <b>✳</b></span></footer>
      </section>
    </main>
    {notice && <div className="toast"><span>✓</span>{notice}</div>}
    {modalOpen && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal() }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><div className="eyebrow">STUDENT REGISTER</div><h2 id="modal-title">{editing ? 'Update student' : 'Enroll a student'}</h2><p>Enter their profile and current academic details.</p></div><button className="modal-close" onClick={closeModal} aria-label="Close">×</button></div><form onSubmit={saveStudent}>
      <div className="form-row"><label>Full name<input required maxLength="80" autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Student name" /></label><label>Student ID<input value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} placeholder="e.g. 26MCA014" /></label></div>
      <div className="form-row"><label>Email address<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="student@college.edu" /></label><label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" /></label></div>
      <div className="form-row"><label>Program / course<input required maxLength="80" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} placeholder="e.g. MCA" /></label><label>Department<input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Computer Science" /></label></div>
      <div className="form-row form-quad"><label>Age<input required type="number" min="1" max="120" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="20" /></label><label>Year<input type="number" min="1" max="8" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></label><label>Semester<input type="number" min="1" max="16" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} /></label><label>Attendance %<input type="number" min="0" max="100" value={form.attendance} onChange={(e) => setForm({ ...form, attendance: e.target.value })} /></label></div>
      <div className="form-row"><label>Enrollment status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Active</option><option>On leave</option><option>Graduated</option></select></label><label>Fee status<select value={form.feeStatus} onChange={(e) => setForm({ ...form, feeStatus: e.target.value })}><option>Due</option><option>Paid</option><option>Scholarship</option></select></label></div>
      {error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={closeModal}>Cancel</button><button className="primary-button" type="submit">{editing ? 'Save profile' : 'Enroll student'}</button></div>
    </form></section></div>}
  </div>
}

export default App
