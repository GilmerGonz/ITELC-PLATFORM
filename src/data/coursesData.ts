// src/data/coursesData.ts

export interface Week {
    id: number;
    title: string;
    // Aquí es donde más adelante "vaciaremos" los 20 ejercicios por semana
    exercises?: any[]; 
  }
  
  export interface Course {
    title: string;
    description: string;
    weeks: Week[];
  }
  
  export const coursesData: Record<string, Course> = {
    a1: {
      title: "English A1",
      description: "Foundational English for beginners.",
      weeks: [
        { id: 1, title: "Greetings & Verb To Be" },
        { id: 2, title: "Personal Info & Numbers" },
        { id: 3, title: "Objects & Places" },
        { id: 4, title: "Family & Relationships" },
        { id: 5, title: "Daily Routines" },
        { id: 6, title: "Hobbies & Free Time" },
        { id: 7, title: "Food & Ordering" },
        { id: 8, title: "House & Furniture" },
        { id: 9, title: "City & Directions" },
        { id: 10, title: "Weather & Clothes" },
        { id: 11, title: "Past Experiences" },
        { id: 12, title: "Future Plans" },
      ]
    },
    a2: {
      title: "English A2",
      description: "Pre-intermediate skills for daily life.",
      weeks: [
        { id: 1, title: "A1 Review & Functional Language" },
        { id: 2, title: "Present Simple vs Continuous" },
        { id: 3, title: "Past Simple: Regular & Irregular" },
        { id: 4, title: "Past Continuous & Narrative" },
        { id: 5, title: "Future: Will & Going To" },
        { id: 6, title: "Modal Verbs & Advice" },
        { id: 7, title: "Countables & Quantifiers" },
        { id: 8, title: "Comparatives & Superlatives" },
        { id: 9, title: "Prepositions of Time & Place" },
        { id: 10, title: "Daily Situation Language" },
        { id: 11, title: "Reading & Listening Skills" },
        { id: 12, title: "A2 Final Summary" },
      ]
    },
    b1: {
      title: "English B1",
      description: "Intermediate level for independent users.",
      weeks: Array.from({ length: 12 }, (_, i) => ({ id: i + 1, title: `B1 Topic Week ${i + 1}` }))
    },
    b2: {
      title: "English B2",
      description: "Upper-intermediate for fluent interaction.",
      weeks: Array.from({ length: 12 }, (_, i) => ({ id: i + 1, title: `B2 Topic Week ${i + 1}` }))
    }
  };