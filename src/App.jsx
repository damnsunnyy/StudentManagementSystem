import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { Activity, ArrowDownUp, BookOpen, Check, ChevronDown, CircleHelp, GraduationCap, LayoutDashboard, MoreHorizontal, Plus, Search, SlidersHorizontal, Users, X, Download, Trash2, ArrowUpRight } from 'lucide-react';

const seedStudents = [
  { _id: 's1', name: 'Olivia Rhye', email: 'olivia.rhye@university.edu', course: 'Computer Science', year: 3, status: 'Active' },
  { _id: 's2', name: 'Phoenix Baker', email: 'phoenix.baker@university.edu', course: 'Business Administration', year: 2, status: 'Active' },
  { _id: 's3', name: 'Lana Steiner', email: 'lana.steiner@university.edu', course: 'Graphic Design', year: 4, status: 'Graduated' },
  { _id: 's4', name: 'Demi Wilkinson', email: 'demi.wilkinson@university.edu', course: 'Computer Science', year: 1, status: 'Active' },
  { _id: 's5', name: 'Candice Wu', email: 'candice.wu@university.edu', course: 'Psychology', year: 3, status: 'On leave' },
  { _id: 's6', name: 'Natali Craig', email: 'natali.craig@university.edu', course: 'Business Administration', year: 2, status: 'Active' },
  { _id: 's7', name: 'Drew Cano', email: 'drew.cano@university.edu', course: 'Computer Science', year: 4, status: 'Active' },
  { _id: 's8', name: 'Orlando Diggs', email: 'orlando.diggs@university.edu', course: 'Psychology', year: 1, status: 'Graduated' },
];
const courses = ['Computer Science', 'Business Administration', 'Graphic Design', 'Psychology', 'Data Science', 'Engineering'];
const terms = ['Fall semester 2026', 'Spring semester 2027', 'Summer semester 2027'];
const emptyForm = { name: '', email: '', course: courses[0], year: '1', status: 'Active' };
const colors = ['rose', 'violet', 'blue', 'amber', 'green', 'pink', 'cyan', 'orange'];

function App() {
  return <BrowserRouter><NexaCampusApp /></BrowserRouter>;
}

function NexaCampusApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const routePages = { '/': 'Students', '/students': 'Students', '/dashboard': 'Dashboard', '/courses': 'Courses' };
  const page = routePages[location.pathname] || 'Students';
  const [students, setStudents] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nexacampus-students') || 'null') || seedStudents; }
    catch { return seedStudents; }
  });
  const [query, setQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All courses');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [apiConnected, setApiConnected] = useState(false);
  const [term, setTerm] = useState(terms[0]);
  const [menu, setMenu] = useState('');

  useEffect(() => {
    if (!routePages[location.pathname]) navigate('/students', { replace: true });
  }, [location.pathname, navigate]);

  useEffect(() => {
    fetch('/api/students').then((response) => { if (!response.ok) throw new Error('API unavailable'); return response.json(); })
      .then((records) => { setStudents(records); setApiConnected(true); }).catch(() => setApiConnected(false));
  }, []);
  useEffect(() => { if (!apiConnected) localStorage.setItem('nexacampus-students', JSON.stringify(students)); }, [students, apiConnected]);
  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(''), 2800); return () => clearTimeout(timer); } }, [toast]);

  const filtered = useMemo(() => students.filter((student) => {
    const search = `${student.name} ${student.email} ${student.course}`.toLowerCase();
    return search.includes(query.toLowerCase()) && (courseFilter === 'All courses' || student.course === courseFilter);
  }).sort((a, b) => a.name.localeCompare(b.name) * (sortAsc ? 1 : -1)), [students, query, courseFilter, sortAsc]);
  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  useEffect(() => { if (currentPage > pageCount) setCurrentPage(pageCount); }, [currentPage, pageCount]);
  const activeCount = students.filter((student) => student.status === 'Active').length;
  const graduatedCount = students.filter((student) => student.status === 'Graduated').length;
  const courseOptions = ['All courses', ...new Set(students.map((student) => student.course))];
  const courseSummary = useMemo(() => courses.map((course) => ({ course, count: students.filter((student) => student.course === course).length, active: students.filter((student) => student.course === course && student.status === 'Active').length })), [students]);

  function goTo(nextPage) {
    const paths = { Dashboard: '/dashboard', Students: '/students', Courses: '/courses' };
    navigate(paths[nextPage] || '/students');
    setMenu('');
    setSelected([]);
  }
  function openCreate() { setForm(emptyForm); setError(''); setModal({ type: 'create' }); }
  function openEdit(student) { setForm({ name: student.name, email: student.email, course: student.course, year: String(student.year), status: student.status }); setError(''); setModal({ type: 'edit', id: student._id }); }
  async function saveStudent(event) {
    event.preventDefault();
    const duplicate = students.some((student) => student.email.toLowerCase() === form.email.trim().toLowerCase() && student._id !== modal.id);
    if (duplicate) { setError('A student with this email already exists.'); return; }
    const payload = { ...form, name: form.name.trim(), email: form.email.trim().toLowerCase(), year: Number(form.year) };
    try {
      if (apiConnected && modal.type === 'create') {
        const response = await fetch('/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await response.json(); if (!response.ok) throw new Error(data.message); setStudents((current) => [data, ...current]);
      } else if (apiConnected) {
        const response = await fetch(`/api/students/${modal.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await response.json(); if (!response.ok) throw new Error(data.message); setStudents((current) => current.map((student) => student._id === modal.id ? data : student));
      } else if (modal.type === 'create') setStudents((current) => [{ ...payload, _id: crypto.randomUUID() }, ...current]);
      else setStudents((current) => current.map((student) => student._id === modal.id ? { ...student, ...payload } : student));
      setModal(null); setToast(modal.type === 'create' ? 'Student added successfully' : 'Student details updated');
    } catch (requestError) { setError(requestError.message || 'Could not save the student.'); }
  }
  async function deleteStudents(ids) {
    if (!ids.length) return;
    if (apiConnected) {
      try { for (const id of ids) { const response = await fetch(`/api/students/${id}`, { method: 'DELETE' }); if (!response.ok) throw new Error('A student could not be deleted.'); } }
      catch (requestError) { setToast(requestError.message); return; }
    }
    setStudents((current) => current.filter((student) => !ids.includes(student._id)));
    setSelected([]); setToast(ids.length === 1 ? 'Student removed' : `${ids.length} students removed`);
  }
  function toggleSelected(id) { setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
  function downloadCsv() {
    const rows = [['Name', 'Email', 'Course', 'Year', 'Status'], ...filtered.map(({ name, email, course, year, status }) => [name, email, course, year, status])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = 'nexacampus-students.csv'; link.click(); URL.revokeObjectURL(link.href); setToast('Student list exported'); setMenu('');
  }
  function resetDemo() { if (apiConnected) { setToast('Reset is available only in demo mode.'); setMenu(''); return; } setStudents(seedStudents); setQuery(''); setCourseFilter('All courses'); setCurrentPage(1); setSelected([]); setMenu(''); setToast('Demo records restored'); }

  return <div className="app-shell">
    <aside className="sidebar">
      <button className="brand" onClick={() => goTo('Dashboard')} aria-label="NexaCampus home"><span className="brand-icon"><GraduationCap size={20} /></span><span>Nexa<span className="brand-light">Campus</span></span></button>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="side-nav">
        <button className={`nav-item ${page === 'Dashboard' ? 'selected' : ''}`} onClick={() => goTo('Dashboard')}><LayoutDashboard size={18} /> Dashboard</button>
        <button className={`nav-item ${page === 'Students' ? 'selected' : ''}`} onClick={() => goTo('Students')}><Users size={18} /> Students <span className="nav-count">{students.length}</span></button>
        <button className={`nav-item ${page === 'Courses' ? 'selected' : ''}`} onClick={() => goTo('Courses')}><BookOpen size={18} /> Courses <span className="nav-count">{courseCount(courseSummary)}</span></button>
      </nav>
      <div className="sidebar-bottom"><button className="help-card" onClick={() => setModal({ type: 'help' })}><span className="help-icon"><CircleHelp size={17} /></span><span className="help-copy"><strong>Need a hand?</strong><span>Open the help guide</span></span><ArrowUpRight size={15} /></button><div className="profile"><div className="avatar admin-avatar">JD</div><div className="profile-info"><strong>Jamie Davis</strong><span>Administrator</span></div><button className="profile-menu-button" onClick={() => setMenu(menu === 'profile' ? '' : 'profile')} aria-label="Open account menu"><MoreHorizontal size={20} /></button>{menu === 'profile' && <div className="popover profile-popover"><strong>Jamie Davis</strong><span>Administrator account</span><button onClick={() => { setModal({ type: 'profile' }); setMenu(''); }}>Account details</button><button onClick={resetDemo}>Reset demo data</button></div>}</div></div>
    </aside>

    <main className="main-area" onClick={() => menu && setMenu('')}>
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>{page}</strong></div><div className="topbar-right"><div className="menu-anchor"><button className="term-pill" onClick={(event) => { event.stopPropagation(); setMenu(menu === 'term' ? '' : 'term'); }}><span />{term}<ChevronDown size={14} /></button>{menu === 'term' && <div className="popover term-popover">{terms.map((item) => <button className={item === term ? 'active-option' : ''} key={item} onClick={() => { setTerm(item); setMenu(''); setToast(`Viewing ${item}`); }}>{item}{item === term && <Check size={14} />}</button>)}</div>}</div><div className="avatar admin-avatar small">JD</div></div></header>
      <div className="page-content">
        {page === 'Students' && <>
          <div className="page-heading"><div><div className="eyebrow">PEOPLE &amp; RECORDS</div><h1>Students</h1><p>Manage student profiles, enrollment, and academic progress.</p></div><button className="primary-button" onClick={openCreate}><Plus size={17} /> Add student</button></div>
          <section className="stats-grid"><Stat icon={<Users size={17} />} label="Total students" value={students.length} detail="Across all programs" accent="violet" /><Stat icon={<Activity size={17} />} label="Active students" value={activeCount} detail={`${students.length ? Math.round(activeCount / students.length * 100) : 0}% of enrollment`} accent="green" /><Stat icon={<BookOpen size={17} />} label="Programs" value={courseCount(courseSummary)} detail="Currently offered" accent="blue" /><Stat icon={<GraduationCap size={18} />} label="Graduated" value={graduatedCount} detail="Alumni records" accent="amber" /></section>
          <section className="table-card"><div className="table-title"><div><h2>All students <span className="soft-count">{filtered.length}</span></h2><p>A directory of everyone enrolled at your institution.</p></div><button className="icon-button" title={`Sort by name ${sortAsc ? 'descending' : 'ascending'}`} onClick={() => setSortAsc((value) => !value)}><ArrowDownUp size={16} /></button></div>
            <div className="table-toolbar"><label className="search-box"><Search size={17} /><input value={query} onChange={(event) => { setQuery(event.target.value); setCurrentPage(1); }} placeholder="Search students..." /></label><label className="filter-select"><SlidersHorizontal size={15} /><select value={courseFilter} onChange={(event) => { setCourseFilter(event.target.value); setCurrentPage(1); }}>{courseOptions.map((course) => <option key={course}>{course}</option>)}</select><ChevronDown size={14} /></label><button className="filter-button" onClick={() => { setQuery(''); setCourseFilter('All courses'); setCurrentPage(1); }}>Clear filters</button><button className="export-button" onClick={downloadCsv}><Download size={14} /> Export CSV</button></div>
            {selected.length > 0 && <div className="bulk-bar"><span><strong>{selected.length}</strong> selected</span><button onClick={() => setSelected([])}>Clear selection</button><button className="bulk-delete" onClick={() => deleteStudents(selected)}><Trash2 size={14} /> Delete selected</button></div>}
            <div className="table-wrap"><table><thead><tr><th><input aria-label="Select all visible students" type="checkbox" checked={visible.length > 0 && visible.every((student) => selected.includes(student._id))} onChange={(event) => setSelected((current) => event.target.checked ? [...new Set([...current, ...visible.map((student) => student._id)])] : current.filter((id) => !visible.some((student) => student._id === id)))} /></th><th>STUDENT</th><th>COURSE</th><th>YEAR</th><th>STATUS</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
              {visible.map((student, index) => <tr key={student._id}><td><input aria-label={`Select ${student.name}`} type="checkbox" checked={selected.includes(student._id)} onChange={() => toggleSelected(student._id)} /></td><td><div className="student-cell"><div className={`avatar ${colors[index % colors.length]}`}>{student.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><div><strong>{student.name}</strong><span>{student.email}</span></div></div></td><td><span className="course-name">{student.course}</span></td><td><span className="year-label">Year {student.year}</span></td><td><span className={`status status-${student.status.toLowerCase().replace(' ', '-')}`}><i />{student.status}</span></td><td><div className="row-actions"><button title={`Edit ${student.name}`} onClick={() => openEdit(student)}>Edit</button><button className="delete-action" title={`Delete ${student.name}`} onClick={() => deleteStudents([student._id])}>Delete</button></div></td></tr>)}
              {visible.length === 0 && <tr><td colSpan="6" className="empty-state"><div className="empty-icon"><Search size={20} /></div><strong>No students found</strong><span>Try a different search or add a student.</span><button onClick={openCreate}>Add a student</button></td></tr>}
            </tbody></table></div><div className="table-footer"><span>Showing <strong>{filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)}</strong> of <strong>{filtered.length}</strong> students</span><div className="pagination"><button disabled={currentPage === 1} onClick={() => setCurrentPage((value) => value - 1)}>← Previous</button><span className="page-number">{currentPage} / {pageCount}</span><button disabled={currentPage >= pageCount} onClick={() => setCurrentPage((value) => value + 1)}>Next →</button></div></div>
          </section><div className="page-footnote"><span>Student records · {term}</span><span>{apiConnected ? 'Connected to MongoDB API' : 'Demo mode · records stored on this device'}</span></div>
        </>}
        {page === 'Dashboard' && <><div className="page-heading"><div><div className="eyebrow">CAMPUS OVERVIEW</div><h1>Good morning, Jamie <span className="wave">✦</span></h1><p>Here’s what’s happening across your campus this term.</p></div><button className="primary-button" onClick={openCreate}><Plus size={17} /> Add student</button></div><section className="stats-grid"><Stat icon={<Users size={17} />} label="Total students" value={students.length} detail="Across all programs" accent="violet" /><Stat icon={<Activity size={17} />} label="Active students" value={activeCount} detail="Currently enrolled" accent="green" /><Stat icon={<BookOpen size={17} />} label="Programs" value={courseCount(courseSummary)} detail="With enrolled students" accent="blue" /><Stat icon={<GraduationCap size={18} />} label="Graduated" value={graduatedCount} detail="Alumni records" accent="amber" /></section><section className="table-card overview-card"><div className="table-title"><div><h2>Program overview</h2><p>Enrollment by course for {term.toLowerCase()}.</p></div><button className="text-link" onClick={() => goTo('Courses')}>View courses <ArrowUpRight size={14} /></button></div><div className="course-overview">{courseSummary.map(({ course, count, active }, index) => <button className="course-overview-row" key={course} onClick={() => { setCourseFilter(course); goTo('Students'); }}><span className={`course-icon course-icon-${index % 4}`}><BookOpen size={17} /></span><span className="course-overview-name"><strong>{course}</strong><small>{active} active students</small></span><span className="course-progress"><i style={{ width: `${students.length ? Math.max(4, count / students.length * 100) : 0}%` }} /></span><b>{count}</b><ArrowUpRight size={15} /></button>)}</div><button className="overview-bottom" onClick={() => goTo('Students')}>Open student directory <ArrowUpRight size={14} /></button></section></>}
        {page === 'Courses' && <><div className="page-heading"><div><div className="eyebrow">ACADEMIC PROGRAMS</div><h1>Courses</h1><p>View enrollment across every program in your institution.</p></div><button className="primary-button" onClick={() => { goTo('Students'); openCreate(); }}><Plus size={17} /> Enroll student</button></div><section className="stats-grid"><Stat icon={<BookOpen size={17} />} label="Programs" value={courseCount(courseSummary)} detail="Available programs" accent="blue" /><Stat icon={<Users size={17} />} label="Enrolled" value={students.length} detail="All student records" accent="violet" /><Stat icon={<Activity size={17} />} label="Active enrollment" value={activeCount} detail="Currently studying" accent="green" /><Stat icon={<GraduationCap size={18} />} label="Alumni" value={graduatedCount} detail="Completed programs" accent="amber" /></section><div className="course-grid">{courseSummary.map(({ course, count, active }, index) => <article className="course-card" key={course}><div className="course-card-top"><span className={`course-icon course-icon-${index % 4}`}><BookOpen size={19} /></span><span className="course-code">PROGRAM {String(index + 1).padStart(2, '0')}</span></div><h2>{course}</h2><p>{count ? `${count} student${count === 1 ? '' : 's'} enrolled` : 'No students enrolled yet'}</p><div className="course-card-footer"><span><i /> {active} active</span><button onClick={() => { setCourseFilter(course); goTo('Students'); }}>View students <ArrowUpRight size={14} /></button></div></article>)}</div></>}
      </div>
    </main>

    {toast && <div className="toast"><span><Check size={15} /></span>{toast}<button onClick={() => setToast('')} aria-label="Dismiss notification"><X size={14} /></button></div>}
    {modal && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setModal(null)}><div className="student-modal">
      {modal.type === 'help' && <><div className="modal-head"><div><div className="eyebrow">NEXACAMPUS GUIDE</div><h2>How can we help?</h2><p>Quick tips for managing your student records.</p></div><button className="icon-button" onClick={() => setModal(null)} aria-label="Close"><X size={17} /></button></div><div className="help-list"><p><strong>Add a student</strong><span>Use the Add student button and complete the enrollment form.</span></p><p><strong>Find a record</strong><span>Search by name, email, or course. Use the course filter to narrow results.</span></p><p><strong>Edit or remove</strong><span>Choose Edit or Delete at the end of any student row.</span></p><p><strong>Save your work</strong><span>{apiConnected ? 'Your changes are connected to the MongoDB API.' : 'Demo mode automatically saves changes in this browser.'}</span></p></div><div className="modal-actions"><button className="primary-button" onClick={() => setModal(null)}>Got it</button></div></>}
      {modal.type === 'profile' && <><div className="modal-head"><div><div className="eyebrow">ACCOUNT</div><h2>Administrator details</h2><p>Your current workspace profile.</p></div><button className="icon-button" onClick={() => setModal(null)} aria-label="Close"><X size={17} /></button></div><div className="profile-detail"><div className="avatar admin-avatar">JD</div><div><strong>Jamie Davis</strong><span>jamie.davis@nexacampus.edu</span><small>Administrator · Campus workspace</small></div></div><div className="modal-actions"><button className="primary-button" onClick={() => setModal(null)}>Done</button></div></>}
      {(modal.type === 'create' || modal.type === 'edit') && <form onSubmit={saveStudent}><div className="modal-head"><div><div className="eyebrow">STUDENT RECORD</div><h2>{modal.type === 'create' ? 'Add a student' : 'Edit student'}</h2><p>Enter the student's details below.</p></div><button type="button" className="icon-button" onClick={() => setModal(null)} aria-label="Close"><X size={17} /></button></div><label className="field">Full name<input autoFocus required minLength="2" maxLength="80" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Alex Morgan" /></label><label className="field">Email address<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="student@university.edu" /></label><div className="field-row"><label className="field">Course<select value={form.course} onChange={(event) => setForm({ ...form, course: event.target.value })}>{courses.map((course) => <option key={course}>{course}</option>)}</select></label><label className="field">Year<select value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })}>{[1, 2, 3, 4, 5, 6].map((year) => <option key={year} value={year}>Year {year}</option>)}</select></label></div><label className="field">Enrollment status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option>Active</option><option>On leave</option><option>Graduated</option></select></label>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="primary-button">{modal.type === 'create' ? 'Add student' : 'Save changes'}</button></div></form>}
    </div></div>}
  </div>;
}

function courseCount(summary) { return summary.filter(({ count }) => count > 0).length; }
function Stat({ icon, label, value, detail, accent }) { return <div className="stat-card"><div className="stat-top"><span>{label}</span><i className={`stat-icon ${accent}`}>{icon}</i></div><div className="stat-value">{value}</div><div className="stat-detail">{detail}</div></div>; }
export default App;
