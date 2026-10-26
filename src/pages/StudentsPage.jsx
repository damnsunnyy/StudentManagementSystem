import {
  Activity,
  ArrowDownUp,
  BookOpen,
  Check,
  ChevronDown,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Plus,
  Printer,
  Search,
  SlidersHorizontal,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { courseCount } from "../utils/metrics.js";
import { StatCard as Stat } from "../components/StatCard.jsx";

export default function StudentsPage({
  students,
  filtered,
  isAdmin,
  openCreate,
  activeCount,
  graduatedCount,
  courseSummary,
  sortAsc,
  setSortAsc,
  query,
  setQuery,
  currentPage,
  setCurrentPage,
  courseFilter,
  setCourseFilter,
  courseOptions,
  menu,
  setMenu,
  exportRecords,
  selected,
  setSelected,
  visible,
  toggleSelected,
  colors,
  openEdit,
  deleteStudents,
  pageCount,
  pageSize,
  apiConnected,
  term,
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">PEOPLE &amp; RECORDS</div>
          <h1>Students</h1>
          <p>Manage student profiles, enrollment, and academic progress.</p>
        </div>
        {isAdmin && (
          <button className="primary-button" onClick={openCreate}>
            <Plus size={17} /> Add student
          </button>
        )}
      </div>
      <section className="stats-grid">
        <Stat
          icon={<Users size={17} />}
          label="Total students"
          value={students.length}
          detail="Across all programs"
          accent="violet"
        />
        <Stat
          icon={<Activity size={17} />}
          label="Active students"
          value={activeCount}
          detail={`${students.length ? Math.round((activeCount / students.length) * 100) : 0}% of enrollment`}
          accent="green"
        />
        <Stat
          icon={<BookOpen size={17} />}
          label="Programs"
          value={courseCount(courseSummary)}
          detail="Currently offered"
          accent="blue"
        />
        <Stat
          icon={<GraduationCap size={18} />}
          label="Graduated"
          value={graduatedCount}
          detail="Alumni records"
          accent="amber"
        />
      </section>
      <section className="table-card">
        <div className="table-title">
          <div>
            <h2>
              All students <span className="soft-count">{filtered.length}</span>
            </h2>
            <p>A directory of everyone enrolled at your institution.</p>
          </div>
          <button
            className="icon-button"
            title={`Sort by name ${sortAsc ? "descending" : "ascending"}`}
            onClick={() => setSortAsc((value) => !value)}
          >
            <ArrowDownUp size={16} />
          </button>
        </div>
        <div className="table-toolbar">
          <label className="search-box">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search students..."
            />
          </label>
          <label className="filter-select">
            <SlidersHorizontal size={15} />
            <select
              value={courseFilter}
              onChange={(event) => {
                setCourseFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              {courseOptions.map((course) => (
                <option key={course}>{course}</option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>
          <button
            className="filter-button"
            onClick={() => {
              setQuery("");
              setCourseFilter("All courses");
              setCurrentPage(1);
            }}
          >
            Clear filters
          </button>
          <div className="menu-anchor">
            <button
              className="export-button"
              onClick={(event) => {
                event.stopPropagation();
                setMenu(menu === "exports" ? "" : "exports");
              }}
            >
              <Download size={14} /> Export <ChevronDown size={13} />
            </button>
            {menu === "exports" && (
              <div className="popover export-popover">
                <span className="export-menu-label">DOWNLOAD REPORT</span>
                <button onClick={() => exportRecords("pdf")}>
                  <Printer size={15} /> Print / Save as PDF
                </button>
                <button onClick={() => exportRecords("word")}>
                  <FileText size={15} /> Word document (.doc)
                </button>
                <button onClick={() => exportRecords("excel")}>
                  <FileSpreadsheet size={15} /> Excel sheet (.xls)
                </button>
                <button onClick={() => exportRecords("csv")}>
                  <FileSpreadsheet size={15} /> CSV spreadsheet
                </button>
                <button onClick={() => exportRecords("json")}>
                  <FileJson size={15} /> JSON data
                </button>
              </div>
            )}
          </div>
        </div>
        {isAdmin && selected.length > 0 && (
          <div className="bulk-bar">
            <span>
              <strong>{selected.length}</strong> selected
            </span>
            <button onClick={() => setSelected([])}>Clear selection</button>
            <button
              className="bulk-delete"
              onClick={() => deleteStudents(selected)}
            >
              <Trash2 size={14} /> Delete selected
            </button>
          </div>
        )}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  {isAdmin && (
                    <input
                      aria-label="Select all visible students"
                      type="checkbox"
                      checked={
                        visible.length > 0 &&
                        visible.every((student) =>
                          selected.includes(student._id),
                        )
                      }
                      onChange={(event) =>
                        setSelected((current) =>
                          event.target.checked
                            ? [
                                ...new Set([
                                  ...current,
                                  ...visible.map((student) => student._id),
                                ]),
                              ]
                            : current.filter(
                                (id) =>
                                  !visible.some(
                                    (student) => student._id === id,
                                  ),
                              ),
                        )
                      }
                    />
                  )}
                </th>
                <th>STUDENT</th>
                <th>COURSE</th>
                <th>YEAR</th>
                <th>STATUS</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((student, index) => (
                <tr key={student._id}>
                  <td>
                    {isAdmin && (
                      <input
                        aria-label={`Select ${student.name}`}
                        type="checkbox"
                        checked={selected.includes(student._id)}
                        onChange={() => toggleSelected(student._id)}
                      />
                    )}
                  </td>
                  <td>
                    <div className="student-cell">
                      <div
                        className={`avatar ${colors[index % colors.length]}`}
                      >
                        {student.name
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <strong>{student.name}</strong>
                        <span>{student.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="course-name">{student.course}</span>
                  </td>
                  <td>
                    <span className="year-label">Year {student.year}</span>
                  </td>
                  <td>
                    <span
                      className={`status status-${student.status.toLowerCase().replace(" ", "-")}`}
                    >
                      <i />
                      {student.status}
                    </span>
                  </td>
                  <td>
                    {isAdmin && (
                      <div className="row-actions">
                        <button
                          title={`Edit ${student.name}`}
                          onClick={() => openEdit(student)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-action"
                          title={`Delete ${student.name}`}
                          onClick={() => deleteStudents([student._id])}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <div className="empty-icon">
                      <Search size={20} />
                    </div>
                    <strong>No students found</strong>
                    <span>Try a different search or add a student.</span>
                    {isAdmin && (
                      <button onClick={openCreate}>Add a student</button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>
            Showing{" "}
            <strong>
              {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–
              {Math.min(currentPage * pageSize, filtered.length)}
            </strong>{" "}
            of <strong>{filtered.length}</strong> students
          </span>
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((value) => value - 1)}
            >
              ← Previous
            </button>
            <span className="page-number">
              {currentPage} / {pageCount}
            </span>
            <button
              disabled={currentPage >= pageCount}
              onClick={() => setCurrentPage((value) => value + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      </section>
      <div className="page-footnote">
        <span>Student records · {term}</span>
        <span>
          {apiConnected
            ? "Connected to MongoDB API"
            : "Demo mode · records stored on this device"}
        </span>
      </div>
    </>
  );
}
