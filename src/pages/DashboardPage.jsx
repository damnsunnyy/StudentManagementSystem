import {
  Activity,
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  Plus,
  Users,
} from "lucide-react";
import { courseCount } from "../utils/metrics.js";
import { StatCard as Stat } from "../components/StatCard.jsx";

export default function DashboardPage({
  account,
  isAdmin,
  openCreate,
  students,
  activeCount,
  graduatedCount,
  courseSummary,
  term,
  goTo,
  setCourseFilter,
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">CAMPUS OVERVIEW</div>
          <h1>
            Welcome, {account.name.split(" ")[0]}{" "}
            <span className="wave">✦</span>
          </h1>
          <p>Here’s what’s happening across your campus this term.</p>
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
          detail="Currently enrolled"
          accent="green"
        />
        <Stat
          icon={<BookOpen size={17} />}
          label="Programs"
          value={courseCount(courseSummary)}
          detail="With enrolled students"
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
      <section className="table-card overview-card">
        <div className="table-title">
          <div>
            <h2>Program overview</h2>
            <p>Enrollment by course for {term.toLowerCase()}.</p>
          </div>
          <button className="text-link" onClick={() => goTo("Courses")}>
            View courses <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="course-overview">
          {courseSummary.map(({ course, count, active }, index) => (
            <button
              className="course-overview-row"
              key={course}
              onClick={() => {
                setCourseFilter(course);
                goTo("Students");
              }}
            >
              <span className={`course-icon course-icon-${index % 4}`}>
                <BookOpen size={17} />
              </span>
              <span className="course-overview-name">
                <strong>{course}</strong>
                <small>{active} active students</small>
              </span>
              <span className="course-progress">
                <i
                  style={{
                    width: `${students.length ? Math.max(4, (count / students.length) * 100) : 0}%`,
                  }}
                />
              </span>
              <b>{count}</b>
              <ArrowUpRight size={15} />
            </button>
          ))}
        </div>
        <button className="overview-bottom" onClick={() => goTo("Students")}>
          Open student directory <ArrowUpRight size={14} />
        </button>
      </section>
    </>
  );
}
