import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Layers3,
  Plus,
  Printer,
  Sparkles,
  X,
} from "lucide-react";

export default function CurriculumPage({
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
}) {
  return (
    <>
      <div className="page-heading editorial-heading">
        <div>
          <div className="eyebrow">ACADEMIC ARCHITECTURE</div>
          <h1>
            Learning, <em>layer by layer.</em>
          </h1>
          <p>
            Explore how each program unfolds from core modules to individual
            lessons.
          </p>
        </div>
        <div className="curriculum-heading-actions">
          <div className="menu-anchor">
            <button
              className="export-button curriculum-export"
              onClick={(event) => {
                event.stopPropagation();
                setMenu(
                  menu === "curriculumExports" ? "" : "curriculumExports",
                );
              }}
            >
              <Download size={14} /> Export map <ChevronDown size={13} />
            </button>
            {menu === "curriculumExports" && (
              <div className="popover export-popover">
                <span className="export-menu-label">CURRICULUM EXPORT</span>
                <button
                  onClick={() =>
                    exportRecords(
                      "pdf",
                      curriculumRows(),
                      "nexacampus-curriculum",
                      `${selectedProgram?.name || "Program"} curriculum`,
                    )
                  }
                >
                  <Printer size={15} /> Print / Save as PDF
                </button>
                <button
                  onClick={() =>
                    exportRecords(
                      "word",
                      curriculumRows(),
                      "nexacampus-curriculum",
                      `${selectedProgram?.name || "Program"} curriculum`,
                    )
                  }
                >
                  <FileText size={15} /> Word document (.doc)
                </button>
                <button
                  onClick={() =>
                    exportRecords(
                      "excel",
                      curriculumRows(),
                      "nexacampus-curriculum",
                      `${selectedProgram?.name || "Program"} curriculum`,
                    )
                  }
                >
                  <FileSpreadsheet size={15} /> Excel sheet (.xls)
                </button>
                <button
                  onClick={() =>
                    exportRecords(
                      "csv",
                      curriculumRows(),
                      "nexacampus-curriculum",
                      `${selectedProgram?.name || "Program"} curriculum`,
                    )
                  }
                >
                  <FileSpreadsheet size={15} /> CSV spreadsheet
                </button>
                <button
                  onClick={() =>
                    exportRecords(
                      "json",
                      curriculumRows(),
                      "nexacampus-curriculum",
                      `${selectedProgram?.name || "Program"} curriculum`,
                    )
                  }
                >
                  <FileJson size={15} /> JSON data
                </button>
              </div>
            )}
          </div>
          {isAdmin && (
            <button
              className="primary-button"
              onClick={() => openCurriculumItem("module")}
            >
              <Plus size={16} /> Add module
            </button>
          )}
        </div>
      </div>
      <section className="curriculum-workspace">
        <div className="curriculum-heading">
          <div>
            <span className="section-kicker">
              <i /> PROGRAM EXPLORER
            </span>
            <h2>Curriculum map</h2>
            <p>Programs → modules → units → lessons</p>
          </div>
          <label className="program-picker">
            <span>PROGRAM</span>
            <select
              value={selectedProgram?._id || ""}
              onChange={(event) => {
                setSelectedProgramId(event.target.value);
                setCurriculumFocus(null);
                setMenuProgramId(event.target.value);
                setMenuModuleIndex(0);
                setMenuUnitIndex(0);
              }}
            >
              {programs.map((program) => (
                <option key={program._id} value={program._id}>
                  {program.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {selectedProgram ? (
          <>
            <div className="curriculum-stats">
              <div>
                <span>MODULES</span>
                <strong>{selectedProgram.modules?.length || 0}</strong>
              </div>
              <div>
                <span>UNITS</span>
                <strong>
                  {(selectedProgram.modules || []).reduce(
                    (sum, module) => sum + (module.units?.length || 0),
                    0,
                  )}
                </strong>
              </div>
              <div>
                <span>LESSONS</span>
                <strong>
                  {(selectedProgram.modules || []).reduce(
                    (sum, module) =>
                      sum +
                      (module.units || []).reduce(
                        (count, unit) => count + (unit.lessons?.length || 0),
                        0,
                      ),
                    0,
                  )}
                </strong>
              </div>
              <div className="curriculum-tip">
                <Sparkles size={15} />
                <span>A clear path from big ideas to focused learning.</span>
              </div>
            </div>
            <div className="curriculum-tree">
              {(selectedProgram.modules || []).map((module, moduleIndex) => (
                <details
                  className="curriculum-module"
                  key={module._id || module.title}
                  open
                >
                  <summary>
                    <span className="tree-index">
                      {String(moduleIndex + 1).padStart(2, "0")}
                    </span>
                    <span className="tree-title">
                      <strong>{module.title}</strong>
                      <small>
                        {module.description || "Program module"} ·{" "}
                        {module.units?.length || 0} units
                      </small>
                    </span>
                    <Layers3 size={17} />
                    {isAdmin && (
                      <button
                        className="tree-delete"
                        title="Remove module"
                        onClick={(event) => {
                          event.preventDefault();
                          removeCurriculumItem("module", moduleIndex);
                        }}
                      >
                        <X size={15} />
                      </button>
                    )}
                    <ChevronRight className="tree-chevron" size={17} />
                  </summary>
                  <div className="curriculum-units">
                    {(module.units || []).map((unit, unitIndex) => (
                      <details
                        className="curriculum-unit"
                        key={unit._id || unit.title}
                        open
                      >
                        <summary>
                          <span className="unit-marker" />
                          <span className="tree-title">
                            <strong>{unit.title}</strong>
                            <small>{unit.lessons?.length || 0} lessons</small>
                          </span>
                          {isAdmin && (
                            <button
                              className="tree-delete"
                              title="Remove unit"
                              onClick={(event) => {
                                event.preventDefault();
                                removeCurriculumItem(
                                  "unit",
                                  moduleIndex,
                                  unitIndex,
                                );
                              }}
                            >
                              <X size={14} />
                            </button>
                          )}
                          <ChevronRight className="tree-chevron" size={15} />
                        </summary>
                        <div className="curriculum-lessons">
                          {(unit.lessons || []).map((lesson, lessonIndex) => (
                            <div
                              id={`lesson-${moduleIndex}-${unitIndex}-${lessonIndex}`}
                              className={`curriculum-lesson ${curriculumFocus?.moduleIndex === moduleIndex && curriculumFocus?.unitIndex === unitIndex && curriculumFocus?.lessonIndex === lessonIndex ? "focused-lesson" : ""}`}
                              key={lesson._id || lesson.title}
                            >
                              <span>
                                <i />
                                {lesson.title}
                              </span>
                              {isAdmin && (
                                <button
                                  className="tree-delete"
                                  title="Remove lesson"
                                  onClick={() =>
                                    removeCurriculumItem(
                                      "lesson",
                                      moduleIndex,
                                      unitIndex,
                                      lessonIndex,
                                    )
                                  }
                                >
                                  <X size={13} />
                                </button>
                              )}
                            </div>
                          ))}
                          {isAdmin && (
                            <button
                              className="tree-add lesson-add"
                              onClick={() =>
                                openCurriculumItem(
                                  "lesson",
                                  moduleIndex,
                                  unitIndex,
                                )
                              }
                            >
                              <Plus size={13} /> Add lesson
                            </button>
                          )}
                        </div>
                      </details>
                    ))}
                    {isAdmin && (
                      <button
                        className="tree-add"
                        onClick={() => openCurriculumItem("unit", moduleIndex)}
                      >
                        <Plus size={13} /> Add unit
                      </button>
                    )}
                  </div>
                </details>
              ))}
              {(selectedProgram.modules || []).length === 0 && (
                <div className="curriculum-empty">
                  <Layers3 size={22} />
                  <strong>No modules yet</strong>
                  <span>Start this learning path by adding a module.</span>
                  {isAdmin && (
                    <button
                      className="primary-button"
                      onClick={() => openCurriculumItem("module")}
                    >
                      <Plus size={15} /> Add first module
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="curriculum-foot">
              <span>CURRICULUM FRAMEWORK</span>
              <strong>{selectedProgram.name}</strong>
              <span>
                {apiConnected
                  ? "Saved to your campus database"
                  : "Offline view"}
              </span>
            </div>
          </>
        ) : (
          <div className="curriculum-empty">
            <Layers3 size={22} />
            <strong>Curriculum is loading</strong>
            <span>
              Start MongoDB and refresh to open the saved program structure.
            </span>
          </div>
        )}
      </section>
    </>
  );
}
