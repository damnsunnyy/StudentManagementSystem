import Program from './models/Program.js';

const initialModules = {
  'Computer Science': ['Programming foundations', 'Data structures', 'Software engineering'],
  'Business Administration': ['Organizations and strategy', 'Accounting fundamentals', 'Marketing principles'],
  'Graphic Design': ['Visual communication', 'Typography studio', 'Digital composition'],
  Psychology: ['Research methods', 'Cognition and learning', 'Social psychology'],
  'Data Science': ['Data preparation', 'Statistical thinking', 'Applied machine learning'],
  Engineering: ['Engineering design', 'Mechanics and materials', 'Systems and circuits'],
};

export async function seedCurriculum() {
  if (await Program.exists()) return;
  const programs = Object.entries(initialModules).map(([name, modules]) => ({
    name,
    modules: modules.map((title) => ({
      title,
      description: `Core study in ${title.toLowerCase()}.`,
      units: [
        { title: 'Foundations', lessons: [{ title: 'Key concepts and terminology' }, { title: 'Guided examples' }] },
        { title: 'Practice and application', lessons: [{ title: 'Workshop activity' }, { title: 'Review and reflection' }] },
      ],
    })),
  }));
  await Program.insertMany(programs, { ordered: false });
}
