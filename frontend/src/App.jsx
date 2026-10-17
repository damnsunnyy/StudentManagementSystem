import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const emptyForm = { name: '', email: '', course: '', age: '' }
const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
const colors = ['lavender', 'peach', 'mint', 'blue', 'rose']

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Request failed')
  return data
}

function App() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('All courses')
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadStudents() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      if (courseFilter !== 'All courses') params.set('course', courseFilter)
      setStudents(await request(`/students?${params}`))
      setError('')
    } catch (err) {
      setError(err.message.includes('fetch') ? 'Can’t reach the API. Start the backend and MongoDB, then refresh.' : err.message)
    } finally { setLoading(false) }
  }

  useEffect(() => { loadStudents() }, [search, courseFilter])

  const courses = useMemo(() => [...new Set([...students.map((student) => student.course), ...(courseFilter !== 'All courses' ? [courseFilter] : [])])].sort(), [students, courseFilter])
  const averageAge = students.length ? Math.round(students.reduce((total, student) => total + student.age, 0) / students.length) : '—'

  function openCreate() { setEditing(null); setForm(emptyForm); setError(''); setModalOpen(true) }
  function openEdit(student) {
    setEditing(student._id)
    setForm({ name: student.name, email: student.email, course: student.course, age: String(student.age) })
    setError('')
    setModalOpen(true)
  }
  function closeModal() { setModalOpen(false); setEditing(null); setForm(emptyForm) }

  async function saveStudent(event) {
    event.preventDefault()
    setError('')
    try {
      const payload = { ...form, age: Number(form.age) }
      await request(editing ? `/students/${editing}` : '/students', {
        method: editing ? 'PUT' : 'POST', body: JSON.stringify(payload),
      })
      closeModal()
      setNotice(editing ? 'Student details updated.' : 'Student added to your directory.')
      loadStudents()
      window.setTimeout(() => setNotice(''), 3200)
    } catch (err) { setError(err.message) }
  }

  async function deleteStudent(student) {
    if (!window.confirm(`Remove ${student.name} from the student directory?`)) return
    try {
      await request(`/students/${student._id}`, { method: 'DELETE' })
      setNotice('Student removed from the directory.')
      loadStudents()
      window.setTimeout(() => setNotice(''), 3200)
    } catch (err) { setError(err.message) }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="Campus home"><span className="brand-mark">C</span><span>campus<span className="brand-dot">.</span></span></a>
        <div className="side-label">WORKSPACE</div>
        <a className="nav-item active" href="#students"><span className="nav-icon">▦</span>Students <span className="nav-count">{students.length}</span></a>
        <div className="side-footer"><div className="help-icon">?</div><div><strong>Need a hand?</strong><span>Check the setup guide</span></div><span className="arrow">↗</span></div>
        <div className="profile"><div className="profile-avatar">AR</div><div className="profile-copy"><strong>Admin</strong><span>Administrator</span></div><button className="more-button" aria-label="More options">···</button></div>
      </aside>

      <main className="main-content" id="top">
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>Students</strong></div><div className="top-actions"><span className="live-status"><i /> All changes saved</span><div className="top-avatar">AR</div></div></header>
        <section className="page-wrap" id="students">
          <div className="page-heading"><div><div className="eyebrow">PEOPLE</div><h1>Students</h1><p className="page-subtitle">A clear view of everyone learning with you.</p></div><button className="primary-button" onClick={openCreate}><span>＋</span> Add student</button></div>

          <div className="stats-grid">
            <article className="stat-card"><div className="stat-top"><span>Total students</span><span className="stat-icon violet">♙</span></div><div className="stat-number">{students.length}<small>students</small></div><div className="stat-note">In your directory</div></article>
            <article className="stat-card"><div className="stat-top"><span>Active courses</span><span className="stat-icon amber">▤</span></div><div className="stat-number">{courses.length}<small>courses</small></div><div className="stat-note">Across your student list</div></article>
            <article className="stat-card"><div className="stat-top"><span>Average age</span><span className="stat-icon green">◷</span></div><div className="stat-number">{averageAge}<small>{students.length ? 'years' : ''}</small></div><div className="stat-note">Across all students</div></article>
          </div>

          <section className="directory-card">
            <div className="directory-heading"><div><h2>All students <span className="count-pill">{students.length}</span></h2><p>Manage your student records in one place.</p></div><button className="export-button" onClick={() => {
              const csv = ['Name,Email,Course,Age', ...students.map((s) => [s.name, s.email, s.course, s.age].map((v) => `"${String(v).replaceAll('"', '""')}"`).join(','))].join('\n')
              const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = 'students.csv'; link.click(); URL.revokeObjectURL(link.href)
            }}><span>↓</span> Export</button></div>
            <div className="table-tools"><label className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students..." /></label><label className="filter-box"><span>Course:</span><select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}><option>All courses</option>{courses.map((course) => <option key={course}>{course}</option>)}</select><b>⌄</b></label></div>
            {error && !modalOpen && <div className="inline-error">{error} <button onClick={loadStudents}>Retry</button></div>}
            <div className="table-scroll"><table><thead><tr><th>STUDENT</th><th>COURSE</th><th>AGE</th><th>ENROLLED</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
              {loading ? <tr><td colSpan="5" className="table-message">Loading students…</td></tr> : students.length === 0 ? <tr><td colSpan="5" className="table-message"><span className="empty-icon">♙</span><strong>{search || courseFilter !== 'All courses' ? 'No matching students' : 'Your directory is ready'}</strong><span>{search || courseFilter !== 'All courses' ? 'Try another search or course filter.' : 'Add your first student to get started.'}</span>{!search && courseFilter === 'All courses' && <button className="text-action" onClick={openCreate}>＋ Add your first student</button>}</td></tr> : students.map((student, index) => <tr key={student._id}><td><div className="student-cell"><div className={`student-avatar ${colors[index % colors.length]}`}>{initials(student.name)}</div><div><strong>{student.name}</strong><span>{student.email}</span></div></div></td><td><span className="course-tag">{student.course}</span></td><td className="age-cell">{student.age} <span>years</span></td><td className="date-cell">{new Date(student.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td><td><div className="row-actions"><button onClick={() => openEdit(student)} aria-label={`Edit ${student.name}`} title="Edit">↗</button><button onClick={() => deleteStudent(student)} aria-label={`Delete ${student.name}`} title="Delete">⌫</button></div></td></tr>)}
            </tbody></table></div>
            <div className="table-footer"><span>Showing <strong>{students.length}</strong> {students.length === 1 ? 'student' : 'students'}</span><span>Student directory <i className="footer-dot" /></span></div>
          </section>
          <footer className="page-footer"><span>© 2025 Campus Admin</span><span>Made for better learning <b>✳</b></span></footer>
        </section>
      </main>

      {notice && <div className="toast"><span>✓</span>{notice}</div>}
      {modalOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal() }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><div className="eyebrow">STUDENT DIRECTORY</div><h2 id="modal-title">{editing ? 'Edit student' : 'Add a student'}</h2><p>{editing ? 'Update this student’s information.' : 'Add someone new to your learning community.'}</p></div><button className="modal-close" onClick={closeModal} aria-label="Close">×</button></div><form onSubmit={saveStudent}><label>Full name<input required maxLength="80" autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rahul Sharma" /></label><label>Email address<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="rahul@example.com" /></label><div className="form-row"><label>Course<input required maxLength="80" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} placeholder="e.g. MCA" /></label><label>Age<input required type="number" min="1" max="120" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="22" /></label></div>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={closeModal}>Cancel</button><button className="primary-button" type="submit">{editing ? 'Save changes' : 'Add student'}</button></div></form></section></div>}
    </div>
  )
}

export default App
