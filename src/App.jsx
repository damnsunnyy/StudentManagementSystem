import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage.jsx";
import StudentsPage from "./pages/StudentsPage.jsx";
import CurriculumPage from "./pages/CurriculumPage.jsx";
import SignInPage from "./pages/SignInPage.jsx";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Layers3,
  X,
} from "lucide-react";

const seedStudents = [
  {
    _id: "s1",
    name: "Olivia Rhye",
    email: "olivia.rhye@university.edu",
    course: "Computer Science",
    year: 3,
    status: "Active",
  },
  {
    _id: "s2",
    name: "Phoenix Baker",
    email: "phoenix.baker@university.edu",
    course: "Business Administration",
    year: 2,
    status: "Active",
  },
  {
    _id: "s3",
    name: "Lana Steiner",
    email: "lana.steiner@university.edu",
    course: "Graphic Design",
    year: 4,
    status: "Graduated",
  },
  {
    _id: "s4",
    name: "Demi Wilkinson",
    email: "demi.wilkinson@university.edu",
    course: "Computer Science",
    year: 1,
    status: "Active",
  },
  {
    _id: "s5",
    name: "Candice Wu",
    email: "candice.wu@university.edu",
    course: "Psychology",
    year: 3,
    status: "On leave",
  },
  {
    _id: "s6",
    name: "Natali Craig",
    email: "natali.craig@university.edu",
    course: "Business Administration",
    year: 2,
    status: "Active",
  },
  {
    _id: "s7",
    name: "Drew Cano",
    email: "drew.cano@university.edu",
    course: "Computer Science",
    year: 4,
    status: "Active",
  },
  {
    _id: "s8",
    name: "Orlando Diggs",
    email: "orlando.diggs@university.edu",
    course: "Psychology",
    year: 1,
    status: "Graduated",
  },
];
const courses = [
  "Computer Science",
  "Business Administration",
  "Graphic Design",
  "Psychology",
  "Data Science",
  "Engineering",
];
const terms = [
  "Fall semester 2026",
  "Spring semester 2027",
  "Summer semester 2027",
];
const emptyForm = {
  name: "",
  email: "",
  course: courses[0],
  year: "1",
  status: "Active",
};
const colors = [
  "rose",
  "violet",
  "blue",
  "amber",
  "green",
  "pink",
  "cyan",
  "orange",
];

function App() {
  return (
    <BrowserRouter>
      <NexaCampusApp />
    </BrowserRouter>
  );
}

function NexaCampusApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const routePages = {
    "/": "Dashboard",
    "/students": "Students",
    "/dashboard": "Dashboard",
    "/courses": "Curriculum",
    "/curriculum": "Curriculum",
  };
  const page = routePages[location.pathname] || "Students";
  const [students, setStudents] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("nexacampus-students") || "null") ||
        seedStudents
      );
    } catch {
      return seedStudents;
    }
  });
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [menuProgramId, setMenuProgramId] = useState("");
  const [menuModuleIndex, setMenuModuleIndex] = useState(0);
  const [menuUnitIndex, setMenuUnitIndex] = useState(0);
  const [curriculumFocus, setCurriculumFocus] = useState(null);
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("All courses");
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [curriculumForm, setCurriculumForm] = useState({
    title: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [apiConnected, setApiConnected] = useState(false);
  const [term, setTerm] = useState(terms[0]);
  const [menu, setMenu] = useState("");
  const [account, setAccount] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nexacampus-account") || "null");
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(
    () => localStorage.getItem("nexacampus-token") || "",
  );
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [loginError, setLoginError] = useState("");
  const [demoLoading, setDemoLoading] = useState("");
  const isAdmin = account?.role === "admin";
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!routePages[location.pathname])
      navigate("/students", { replace: true });
  }, [location.pathname, navigate]);
  useEffect(() => {
    if (location.pathname !== "/curriculum" || !curriculumFocus) return;
    const timer = setTimeout(
      () =>
        document
          .getElementById(
            `lesson-${curriculumFocus.moduleIndex}-${curriculumFocus.unitIndex}-${curriculumFocus.lessonIndex}`,
          )
          ?.scrollIntoView({ behavior: "smooth", block: "center" }),
      120,
    );
    return () => clearTimeout(timer);
  }, [location.pathname, selectedProgramId, curriculumFocus]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/students", { headers: authHeaders })
      .then((response) => {
        if (!response.ok) throw new Error("API unavailable");
        return response.json();
      })
      .then((records) => {
        setStudents(records);
        setApiConnected(true);
      })
      .catch(() => setApiConnected(false));
  }, [token]);
  useEffect(() => {
    if (!token) return;
    fetch("/api/programs", { headers: authHeaders })
      .then((response) => {
        if (!response.ok) throw new Error("Curriculum unavailable");
        return response.json();
      })
      .then((records) => {
        setPrograms(records);
        setSelectedProgramId((current) => current || records[0]?._id || "");
      })
      .catch(() => setPrograms([]));
  }, [token]);
  useEffect(() => {
    if (!apiConnected)
      localStorage.setItem("nexacampus-students", JSON.stringify(students));
  }, [students, apiConnected]);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 2800);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const filtered = useMemo(
    () =>
      students
        .filter((student) => {
          const search =
            `${student.name} ${student.email} ${student.course}`.toLowerCase();
          return (
            search.includes(query.toLowerCase()) &&
            (courseFilter === "All courses" || student.course === courseFilter)
          );
        })
        .sort((a, b) => a.name.localeCompare(b.name) * (sortAsc ? 1 : -1)),
    [students, query, courseFilter, sortAsc],
  );
  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  useEffect(() => {
    if (currentPage > pageCount) setCurrentPage(pageCount);
  }, [currentPage, pageCount]);
  const activeCount = students.filter(
    (student) => student.status === "Active",
  ).length;
  const graduatedCount = students.filter(
    (student) => student.status === "Graduated",
  ).length;
  const courseOptions = [
    "All courses",
    ...new Set(students.map((student) => student.course)),
  ];
  const courseSummary = useMemo(
    () =>
      courses.map((course) => ({
        course,
        count: students.filter((student) => student.course === course).length,
        active: students.filter(
          (student) => student.course === course && student.status === "Active",
        ).length,
      })),
    [students],
  );
  const selectedProgram =
    programs.find((program) => program._id === selectedProgramId) ||
    programs[0];
  const menuProgram =
    programs.find(
      (program) => program._id === (menuProgramId || selectedProgram?._id),
    ) || programs[0];
  const menuModules = menuProgram?.modules || [];
  const menuModule = menuModules[menuModuleIndex];
  const menuUnits = menuModule?.units || [];
  const menuUnit = menuUnits[menuUnitIndex];

  function goTo(nextPage) {
    const paths = {
      Dashboard: "/dashboard",
      Students: "/students",
      Courses: "/curriculum",
      Curriculum: "/curriculum",
    };
    navigate(paths[nextPage] || "/students");
    setMenu("");
    setSelected([]);
  }
  function openCreate() {
    setForm(emptyForm);
    setError("");
    setModal({ type: "create" });
  }
  function openEdit(student) {
    setForm({
      name: student.name,
      email: student.email,
      course: student.course,
      year: String(student.year),
      status: student.status,
    });
    setError("");
    setModal({ type: "edit", id: student._id });
  }
  async function saveStudent(event) {
    event.preventDefault();
    const duplicate = students.some(
      (student) =>
        student.email.toLowerCase() === form.email.trim().toLowerCase() &&
        student._id !== modal.id,
    );
    if (duplicate) {
      setError("A student with this email already exists.");
      return;
    }
    const payload = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      year: Number(form.year),
    };
    try {
      if (apiConnected && modal.type === "create") {
        const response = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setStudents((current) => [data, ...current]);
      } else if (apiConnected) {
        const response = await fetch(`/api/students/${modal.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setStudents((current) =>
          current.map((student) => (student._id === modal.id ? data : student)),
        );
      } else if (modal.type === "create")
        setStudents((current) => [
          { ...payload, _id: crypto.randomUUID() },
          ...current,
        ]);
      else
        setStudents((current) =>
          current.map((student) =>
            student._id === modal.id ? { ...student, ...payload } : student,
          ),
        );
      setModal(null);
      setToast(
        modal.type === "create"
          ? "Student added successfully"
          : "Student details updated",
      );
    } catch (requestError) {
      setError(requestError.message || "Could not save the student.");
    }
  }
  async function deleteStudents(ids) {
    if (!ids.length) return;
    if (apiConnected) {
      try {
        for (const id of ids) {
          const response = await fetch(`/api/students/${id}`, {
            method: "DELETE",
            headers: authHeaders,
          });
          if (!response.ok) throw new Error("A student could not be deleted.");
        }
      } catch (requestError) {
        setToast(requestError.message);
        return;
      }
    }
    setStudents((current) =>
      current.filter((student) => !ids.includes(student._id)),
    );
    setSelected([]);
    setToast(
      ids.length === 1 ? "Student removed" : `${ids.length} students removed`,
    );
  }
  function toggleSelected(id) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }
  function exportRows() {
    return filtered.map(({ name, email, course, year, status }) => ({
      Name: name,
      Email: email,
      Program: course,
      Year: year,
      Status: status,
    }));
  }
  function downloadFile(content, mime, filename) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([content], { type: mime }));
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    setMenu("");
  }
  function escapeHtml(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character],
    );
  }
  function exportRecords(
    format,
    rowsOverride = null,
    fileBase = "nexacampus-students",
    reportTitle = "NexaCampus student report",
  ) {
    const rows = rowsOverride || exportRows();
    const headers = rows.length
      ? Object.keys(rows[0])
      : fileBase.endsWith("curriculum")
        ? ["Program", "Module", "Unit", "Lesson"]
        : ["Name", "Email", "Program", "Year", "Status"];
    const table = `<table><thead><tr>${headers.map((heading) => `<th>${escapeHtml(heading)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${headers.map((heading) => `<td>${escapeHtml(row[heading])}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    const filename = fileBase;
    if (format === "csv") {
      const csv = [
        headers,
        ...rows.map((row) => headers.map((heading) => row[heading])),
      ]
        .map((row) =>
          row
            .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
            .join(","),
        )
        .join("\r\n");
      downloadFile(`\ufeff${csv}`, "text/csv;charset=utf-8", `${filename}.csv`);
    } else if (format === "excel") {
      const workbook = `<!doctype html><html><head><meta charset="utf-8"></head><body>${table}</body></html>`;
      downloadFile(
        workbook,
        "application/vnd.ms-excel;charset=utf-8",
        `${filename}.xls`,
      );
    } else if (format === "word") {
      const documentHtml = `<!doctype html><html><head><meta charset="utf-8"><style>body{font:11pt Arial;color:#243128}h1{font:26pt Georgia;color:#243e31}table{border-collapse:collapse;width:100%}th,td{border:1px solid #dce3d7;padding:7px;text-align:left}th{background:#eff3e9}</style></head><body><h1>${escapeHtml(reportTitle)}</h1><p>${rows.length} matching records · ${new Date().toLocaleDateString()}</p>${table}</body></html>`;
      downloadFile(
        `\ufeff${documentHtml}`,
        "application/msword;charset=utf-8",
        `${filename}.doc`,
      );
    } else if (format === "json") {
      downloadFile(
        JSON.stringify(rows, null, 2),
        "application/json;charset=utf-8",
        `${filename}.json`,
      );
    } else if (format === "pdf") {
      setMenu("");
      const report = window.open("", "_blank");
      if (!report) {
        setToast("Allow pop-ups to create the PDF print view.");
        return;
      }
      report.document.write(
        `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(reportTitle)}</title><style>@page{size:A4 landscape;margin:16mm}body{font:11px Arial;color:#243128}h1{font:30px Georgia;color:#243e31;margin:0 0 6px}.meta{color:#718174;margin:0 0 20px}table{border-collapse:collapse;width:100%}th,td{border-bottom:1px solid #dfe5db;padding:9px 8px;text-align:left}th{background:#eff3e9;color:#465648}tr{break-inside:avoid}footer{position:fixed;bottom:0;color:#899588;font-size:9px}</style></head><body><h1>${escapeHtml(reportTitle)}</h1><p class="meta">${rows.length} matching records · ${new Date().toLocaleDateString()}</p>${table}<footer>Generated by NexaCampus</footer><script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}</script></body></html>`,
      );
      report.document.close();
    }
    setToast(`${format.toUpperCase()} export prepared`);
  }
  async function persistCurriculum(modules) {
    if (!selectedProgram || !isAdmin || !apiConnected) return;
    const response = await fetch(`/api/programs/${selectedProgram._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ modules }),
    });
    const result = await response.json();
    if (!response.ok)
      throw new Error(result.message || "Could not save the curriculum.");
    setPrograms((current) =>
      current.map((program) => (program._id === result._id ? result : program)),
    );
  }
  function curriculumRows() {
    return (selectedProgram?.modules || []).flatMap((module) => {
      if (!module.units?.length)
        return [
          {
            Program: selectedProgram.name,
            Module: module.title,
            Unit: "",
            Lesson: "",
          },
        ];
      return module.units.flatMap((unit) =>
        unit.lessons?.length
          ? unit.lessons.map((lesson) => ({
              Program: selectedProgram.name,
              Module: module.title,
              Unit: unit.title,
              Lesson: lesson.title,
            }))
          : [
              {
                Program: selectedProgram.name,
                Module: module.title,
                Unit: unit.title,
                Lesson: "",
              },
            ],
      );
    });
  }
  function openCurriculumItem(level, moduleIndex = -1, unitIndex = -1) {
    setCurriculumForm({ title: "", description: "" });
    setError("");
    setModal({ type: "curriculum", level, moduleIndex, unitIndex });
  }
  async function saveCurriculumItem(event) {
    event.preventDefault();
    if (!selectedProgram) return;
    const modules = JSON.parse(JSON.stringify(selectedProgram.modules || []));
    const item = { title: curriculumForm.title.trim() };
    if (modal.level === "module")
      modules.push({
        ...item,
        description: curriculumForm.description.trim(),
        units: [],
      });
    if (modal.level === "unit")
      modules[modal.moduleIndex].units.push({ ...item, lessons: [] });
    if (modal.level === "lesson")
      modules[modal.moduleIndex].units[modal.unitIndex].lessons.push(item);
    try {
      await persistCurriculum(modules);
      setModal(null);
      setToast(`${modal.level[0].toUpperCase()}${modal.level.slice(1)} added`);
    } catch (requestError) {
      setError(requestError.message);
    }
  }
  async function removeCurriculumItem(
    level,
    moduleIndex,
    unitIndex = -1,
    lessonIndex = -1,
  ) {
    if (!selectedProgram || !isAdmin) return;
    if (!window.confirm(`Remove this ${level} and everything inside it?`))
      return;
    const modules = JSON.parse(JSON.stringify(selectedProgram.modules || []));
    if (level === "module") modules.splice(moduleIndex, 1);
    if (level === "unit") modules[moduleIndex].units.splice(unitIndex, 1);
    if (level === "lesson")
      modules[moduleIndex].units[unitIndex].lessons.splice(lessonIndex, 1);
    try {
      await persistCurriculum(modules);
      setToast(`${level[0].toUpperCase()}${level.slice(1)} removed`);
    } catch (requestError) {
      setToast(requestError.message);
    }
  }
  function resetDemo() {
    if (apiConnected) {
      setToast("Reset is available only in demo mode.");
      setMenu("");
      return;
    }
    setStudents(seedStudents);
    setQuery("");
    setCourseFilter("All courses");
    setCurrentPage(1);
    setSelected([]);
    setMenu("");
    setToast("Demo records restored");
  }

  async function signIn(event) {
    event.preventDefault();
    setLoginError("");
    try {
      if (authMode === "register" && loginPassword !== confirmPassword)
        throw new Error("Passwords do not match.");
      const response = await fetch(`/api/auth/${authMode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          authMode === "register"
            ? { name: registerName, email: loginEmail, password: loginPassword }
            : { email: loginEmail, password: loginPassword },
        ),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not sign in.");
      localStorage.setItem("nexacampus-token", result.token);
      localStorage.setItem("nexacampus-account", JSON.stringify(result.user));
      setToken(result.token);
      setAccount(result.user);
      setLoginPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      setLoginError(
        requestError.message ||
          "Could not connect to the server. Start the app and try again.",
      );
    }
  }
  async function demoSignIn(role) {
    setLoginError("");
    setDemoLoading(role);
    try {
      const response = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not open demo access.");
      localStorage.setItem("nexacampus-token", result.token);
      localStorage.setItem("nexacampus-account", JSON.stringify(result.user));
      setToken(result.token);
      setAccount(result.user);
    } catch (requestError) {
      setLoginError(requestError.message || "Could not connect to the server.");
    } finally {
      setDemoLoading("");
    }
  }
  function signOut() {
    localStorage.removeItem("nexacampus-token");
    localStorage.removeItem("nexacampus-account");
    setToken("");
    setAccount(null);
    setApiConnected(false);
  }

  const signInPageProps = {
    authMode,
    setAuthMode,
    signIn,
    demoSignIn,
    demoLoading,
    loginError,
    setLoginError,
    registerName,
    setRegisterName,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    confirmPassword,
    setConfirmPassword,
  };
  const studentPageProps = {
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
  };
  const dashboardPageProps = {
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
  };
  const curriculumPageProps = {
    isAdmin,
    menu,
    setMenu,
    exportRecords,
    curriculumRows,
    selectedProgram,
    openCurriculumItem,
    programs,
    setSelectedProgramId,
    setCurriculumFocus,
    setMenuProgramId,
    setMenuModuleIndex,
    setMenuUnitIndex,
    apiConnected,
    removeCurriculumItem,
    curriculumFocus,
  };

  if (!account || !token) return <SignInPage {...signInPageProps} />;

  return (
    <div className="app-shell">
      <main className="main-area" onClick={() => menu && setMenu("")}>
        <header className="topbar">
          <button
            className="brand"
            onClick={() => goTo("Dashboard")}
            aria-label="NexaCampus home"
          >
            <img className="brand-logo" src="/nexacampus.svg" alt="" />
            <span>
              Nexa<span className="brand-light">Campus</span>
            </span>
          </button>
          <nav className="top-nav" aria-label="Main navigation">
            <button
              className={page === "Dashboard" ? "active" : ""}
              onClick={() => goTo("Dashboard")}
            >
              Overview
            </button>
            <button
              className={page === "Students" ? "active" : ""}
              onClick={() => goTo("Students")}
            >
              Students <span>{students.length}</span>
            </button>
            <div className="mega-nav-root">
              <button
                className={`mega-nav-trigger ${page === "Curriculum" ? "active" : ""}`}
                onClick={() => goTo("Curriculum")}
              >
                Curriculum <span>{programs.length || courses.length}</span>
              </button>
              <button
                className={`mega-menu-toggle ${menu === "curriculumNav" ? "menu-open" : ""}`}
                aria-label="Open curriculum submenus"
                aria-expanded={menu === "curriculumNav"}
                onClick={(event) => {
                  event.stopPropagation();
                  setMenu(menu === "curriculumNav" ? "" : "curriculumNav");
                }}
              >
                <ChevronDown className="mega-trigger-chevron" size={13} />
              </button>
              {menu === "curriculumNav" && (
                <div
                  className="curriculum-mega"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="mega-heading">
                    <div>
                      <span className="section-kicker">
                        <i /> ACADEMIC NAVIGATION
                      </span>
                      <strong>Explore the learning map</strong>
                    </div>
                    <button
                      onClick={() => {
                        navigate("/curriculum");
                        setMenu("");
                      }}
                      className="mega-open-link"
                    >
                      Open curriculum <ArrowUpRight size={13} />
                    </button>
                  </div>
                  <div className="mega-columns">
                    <div className="mega-column">
                      <label>01 · PROGRAMS</label>
                      <div className="mega-list">
                        {programs.map((program) => (
                          <button
                            key={program._id}
                            className={
                              menuProgram?._id === program._id ? "selected" : ""
                            }
                            onClick={() => {
                              setMenuProgramId(program._id);
                              setSelectedProgramId(program._id);
                              setMenuModuleIndex(0);
                              setMenuUnitIndex(0);
                            }}
                          >
                            <BookOpen size={14} />
                            <span>{program.name}</span>
                            <ChevronRight size={13} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mega-column">
                      <label>
                        02 · MODULES <small>{menuModules.length}</small>
                      </label>
                      <div className="mega-list">
                        {menuModules.map((module, index) => (
                          <button
                            key={module._id || module.title}
                            className={
                              menuModuleIndex === index ? "selected" : ""
                            }
                            onClick={() => {
                              setMenuModuleIndex(index);
                              setMenuUnitIndex(0);
                            }}
                          >
                            <Layers3 size={14} />
                            <span>{module.title}</span>
                            <ChevronRight size={13} />
                          </button>
                        ))}
                        {!menuModules.length && (
                          <span className="mega-empty">No modules yet</span>
                        )}
                      </div>
                    </div>
                    <div className="mega-column">
                      <label>
                        03 · UNITS <small>{menuUnits.length}</small>
                      </label>
                      <div className="mega-list">
                        {menuUnits.map((unit, index) => (
                          <button
                            key={unit._id || unit.title}
                            className={
                              menuUnitIndex === index ? "selected" : ""
                            }
                            onClick={() => setMenuUnitIndex(index)}
                          >
                            <span className="mega-unit-dot" />
                            <span>{unit.title}</span>
                            <ChevronRight size={13} />
                          </button>
                        ))}
                        {!menuUnits.length && (
                          <span className="mega-empty">Select a module</span>
                        )}
                      </div>
                    </div>
                    <div className="mega-column">
                      <label>
                        04 · LESSONS{" "}
                        <small>{menuUnit?.lessons?.length || 0}</small>
                      </label>
                      <div className="mega-list mega-lessons">
                        {(menuUnit?.lessons || []).map((lesson, index) => (
                          <button
                            key={lesson._id || lesson.title}
                            onClick={() => {
                              setSelectedProgramId(menuProgram._id);
                              setCurriculumFocus({
                                moduleIndex: menuModuleIndex,
                                unitIndex: menuUnitIndex,
                                lessonIndex: index,
                              });
                              navigate("/curriculum");
                              setMenu("");
                            }}
                          >
                            <span className="mega-lesson-number">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span>{lesson.title}</span>
                          </button>
                        ))}
                        {!menuUnit?.lessons?.length && (
                          <span className="mega-empty">Select a unit</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>
          <div className="topbar-actions">
            <span className="local-status">
              <i /> {apiConnected ? "MONGODB CONNECTED" : "LOCAL WORKSPACE"}
            </span>
            <div className="menu-anchor">
              <button
                className="account-button"
                onClick={(event) => {
                  event.stopPropagation();
                  setMenu(menu === "profile" ? "" : "profile");
                }}
              >
                <span className="avatar admin-avatar small">
                  {account.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <span>{account.name.split(" ")[0]}</span>
                <ChevronDown size={13} />
              </button>
              {menu === "profile" && (
                <div className="popover profile-popover top-account-popover">
                  <strong>{account.name}</strong>
                  <span>
                    {account.email} ·{" "}
                    {isAdmin ? "Administrator" : "Standard user"}
                  </span>
                  <button onClick={signOut}>Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="page-content">
          {page === "Dashboard" && <DashboardPage {...dashboardPageProps} />}
          {page === "Students" && <StudentsPage {...studentPageProps} />}
          {page === "Curriculum" && <CurriculumPage {...curriculumPageProps} />}
        </div>
      </main>

      {toast && (
        <div className="toast">
          <span>
            <Check size={15} />
          </span>
          {toast}
          <button
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      )}
      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setModal(null)
          }
        >
          <div className="student-modal">
            {modal.type === "help" && (
              <>
                <div className="modal-head">
                  <div>
                    <div className="eyebrow">NEXACAMPUS GUIDE</div>
                    <h2>How can we help?</h2>
                    <p>Quick tips for managing your student records.</p>
                  </div>
                  <button
                    className="icon-button"
                    onClick={() => setModal(null)}
                    aria-label="Close"
                  >
                    <X size={17} />
                  </button>
                </div>
                <div className="help-list">
                  <p>
                    <strong>Add a student</strong>
                    <span>
                      Use the Add student button and complete the enrollment
                      form.
                    </span>
                  </p>
                  <p>
                    <strong>Find a record</strong>
                    <span>
                      Search by name, email, or course. Use the course filter to
                      narrow results.
                    </span>
                  </p>
                  <p>
                    <strong>Edit or remove</strong>
                    <span>
                      Choose Edit or Delete at the end of any student row.
                    </span>
                  </p>
                  <p>
                    <strong>Save your work</strong>
                    <span>
                      {apiConnected
                        ? "Your changes are connected to the MongoDB API."
                        : "Demo mode automatically saves changes in this browser."}
                    </span>
                  </p>
                </div>
                <div className="modal-actions">
                  <button
                    className="primary-button"
                    onClick={() => setModal(null)}
                  >
                    Got it
                  </button>
                </div>
              </>
            )}
            {modal.type === "profile" && (
              <>
                <div className="modal-head">
                  <div>
                    <div className="eyebrow">ACCOUNT</div>
                    <h2>Administrator details</h2>
                    <p>Your current workspace profile.</p>
                  </div>
                  <button
                    className="icon-button"
                    onClick={() => setModal(null)}
                    aria-label="Close"
                  >
                    <X size={17} />
                  </button>
                </div>
                <div className="profile-detail">
                  <div className="avatar admin-avatar">JD</div>
                  <div>
                    <strong>Jamie Davis</strong>
                    <span>jamie.davis@nexacampus.edu</span>
                    <small>Administrator · Campus workspace</small>
                  </div>
                </div>
                <div className="modal-actions">
                  <button
                    className="primary-button"
                    onClick={() => setModal(null)}
                  >
                    Done
                  </button>
                </div>
              </>
            )}
            {(modal.type === "create" || modal.type === "edit") && (
              <form onSubmit={saveStudent}>
                <div className="modal-head">
                  <div>
                    <div className="eyebrow">STUDENT RECORD</div>
                    <h2>
                      {modal.type === "create"
                        ? "Add a student"
                        : "Edit student"}
                    </h2>
                    <p>Enter the student's details below.</p>
                  </div>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => setModal(null)}
                    aria-label="Close"
                  >
                    <X size={17} />
                  </button>
                </div>
                <label className="field">
                  Full name
                  <input
                    autoFocus
                    required
                    minLength="2"
                    maxLength="80"
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="e.g. Alex Morgan"
                  />
                </label>
                <label className="field">
                  Email address
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    placeholder="student@university.edu"
                  />
                </label>
                <div className="field-row">
                  <label className="field">
                    Course
                    <select
                      value={form.course}
                      onChange={(event) =>
                        setForm({ ...form, course: event.target.value })
                      }
                    >
                      {courses.map((course) => (
                        <option key={course}>{course}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    Year
                    <select
                      value={form.year}
                      onChange={(event) =>
                        setForm({ ...form, year: event.target.value })
                      }
                    >
                      {[1, 2, 3, 4, 5, 6].map((year) => (
                        <option key={year} value={year}>
                          Year {year}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="field">
                  Enrollment status
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({ ...form, status: event.target.value })
                    }
                  >
                    <option>Active</option>
                    <option>On leave</option>
                    <option>Graduated</option>
                  </select>
                </label>
                {error && <div className="form-error">{error}</div>}
                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-button">
                    {modal.type === "create" ? "Add student" : "Save changes"}
                  </button>
                </div>
              </form>
            )}
            {modal.type === "curriculum" && (
              <form onSubmit={saveCurriculumItem}>
                <div className="modal-head">
                  <div>
                    <div className="eyebrow">CURRICULUM BUILDER</div>
                    <h2>Add a {modal.level}</h2>
                    <p>
                      {modal.level === "module"
                        ? "Add a new branch to this program."
                        : modal.level === "unit"
                          ? "Break this module into a focused unit."
                          : "Add a lesson inside this unit."}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => setModal(null)}
                    aria-label="Close"
                  >
                    <X size={17} />
                  </button>
                </div>
                <label className="field">
                  {modal.level[0].toUpperCase() + modal.level.slice(1)} title
                  <input
                    autoFocus
                    required
                    minLength="2"
                    maxLength="100"
                    value={curriculumForm.title}
                    onChange={(event) =>
                      setCurriculumForm({
                        ...curriculumForm,
                        title: event.target.value,
                      })
                    }
                    placeholder={
                      modal.level === "module"
                        ? "e.g. Applied research"
                        : modal.level === "unit"
                          ? "e.g. Research design"
                          : "e.g. Forming a research question"
                    }
                  />
                </label>
                {modal.level === "module" && (
                  <label className="field">
                    Short description
                    <textarea
                      maxLength="240"
                      value={curriculumForm.description}
                      onChange={(event) =>
                        setCurriculumForm({
                          ...curriculumForm,
                          description: event.target.value,
                        })
                      }
                      placeholder="What will students explore in this module?"
                    />
                  </label>
                )}
                {error && <div className="form-error">{error}</div>}
                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-button">
                    Add {modal.level}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
