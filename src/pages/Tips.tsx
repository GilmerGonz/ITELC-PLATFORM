import React from "react";
import SmartHeader from "@/components/SmartHeader";
import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

const tipsA1 = [
  { week: 1, title: "Greetings & To Be", image: "https://picsum.photos/id/1/500/300", tip: "Master your intro! Spend 2 minutes daily introducing yourself to the mirror." },
  { week: 2, title: "Numbers & Personal Info", image: "https://picsum.photos/id/20/500/300", tip: "Say your phone passcode out loud in English every time you unlock your screen." },
  { week: 3, title: "Common Objects & Plurals", image: "https://picsum.photos/id/24/500/300", tip: "Label your world! Put sticky notes on 5 common items." },
  { week: 4, title: "Family Members & Possessive 's", image: "https://picsum.photos/id/22/500/300", tip: "Describe your family: 'My mother is kind' or 'This is my brother's car'." },
  { week: 5, title: "Present Simple: Daily Routines", image: "https://picsum.photos/id/48/500/300", tip: "Narrate your morning: 'I make coffee, then I drink it'." },
  { week: 6, title: "Hobbies & Liking", image: "https://picsum.photos/id/64/500/300", tip: "List 5 things you love and 5 you hate doing in your free time." },
  { week: 7, title: "Food, Drink & Countable Nouns", image: "https://picsum.photos/id/102/500/300", tip: "When cooking, name ingredients: 'An apple' or 'Some milk'." },
  { week: 8, title: "Parts of the House & Prepositions", image: "https://picsum.photos/id/103/500/300", tip: "Practice: 'The keys are ON the table', 'The cat is UNDER the chair'." },
  { week: 9, title: "Places in the City & Directions", image: "https://picsum.photos/id/122/500/300", tip: "Look at a map and explain how to get to the store in English." },
  { week: 10, title: "Weather & Clothing", image: "https://picsum.photos/id/146/500/300", tip: "Check the forecast and name the clothes you need today." },
  { week: 11, title: "Past Simple & Regular Verbs", image: "https://picsum.photos/id/160/500/300", tip: "Think about yesterday: 'I cooked', 'I cleaned', 'I studied'." },
  { week: 12, title: "Future: Going to & Review", image: "https://picsum.photos/id/180/500/300", tip: "Plan your next level: 'I am going to study A2 English very hard'." },
];

const tipsA2 = [
  { week: 1, title: "Present Simple vs. Continuous", image: "https://picsum.photos/id/201/500/300", tip: "Compare: 'I usually drink coffee' vs 'I am drinking water now'." },
  { week: 2, title: "Past Simple & Irregular Verbs", image: "https://picsum.photos/id/250/500/300", tip: "Group verbs by sound pattern: sing-sang, ring-rang." },
  { week: 3, title: "Past Continuous vs. Simple", image: "https://picsum.photos/id/270/500/300", tip: "Use interruptions: 'I was sleeping when the phone rang'." },
  { week: 4, title: "Comparatives & Superlatives", image: "https://picsum.photos/id/319/500/300", tip: "Compare objects: 'This phone is better than that one'." },
  { week: 5, title: "Possessive Adjectives & Pronouns", image: "https://picsum.photos/id/338/500/300", tip: "Don't confuse: 'It's MY book' vs 'The book is MINE'." },
  { week: 6, title: "Present Perfect 1", image: "https://picsum.photos/id/367/500/300", tip: "Life experiences: 'I have traveled to Italy' (no specific time)." },
  { week: 7, title: "Present Perfect 2", image: "https://picsum.photos/id/392/500/300", tip: "Use 'for' and 'since': 'I have lived here for 5 years'." },
  { week: 8, title: "Modals of Possibility & Ability", image: "https://picsum.photos/id/433/500/300", tip: "Use 'might' for chance and 'can' for skills." },
  { week: 9, title: "Future: Will vs Going to", image: "https://picsum.photos/id/445/500/300", tip: "Predictions (Will) vs. Plans (Going to)." },
  { week: 10, title: "First Conditional", image: "https://picsum.photos/id/452/500/300", tip: "Promises: 'If I study today, I will pass the exam'." },
  { week: 11, title: "Adverbs of Manner & Quantity", image: "https://picsum.photos/id/524/500/300", tip: "Describe HOW: 'I speak slowly', 'I work hard'." },
  { week: 12, title: "General Review & B1 Prep", image: "https://picsum.photos/id/558/500/300", tip: "Write a paragraph about your journey so far." },
];

const tipsB1 = [
  { week: 1, title: "Complex Routines", image: "https://picsum.photos/id/101/500/300", tip: "Use frequency adverbs to detail habits. Ex: 'I seldom exercise, but I frequently walk to work'." },
  { week: 2, title: "Narrative Tenses", image: "https://picsum.photos/id/111/500/300", tip: "Past Continuous sets the background. Ex: 'I was walking home when I saw a famous actor'." },
  { week: 3, title: "Present Perfect", image: "https://picsum.photos/id/121/500/300", tip: "Talk about life experiences without a specific date. Ex: 'I have visited France three times'." },
  { week: 4, title: "Future Decisions", image: "https://picsum.photos/id/131/500/300", tip: "Will vs Going to. Ex: 'I think it will rain' (prediction) vs 'I am going to buy bread' (plan)." },
  { week: 5, title: "Modifiers in Comparison", image: "https://picsum.photos/id/141/500/300", tip: "Add precision with 'much' or 'a bit'. Ex: Tokyo is much more expensive than my hometown'." },
  { week: 6, title: "Modal Regrets", image: "https://picsum.photos/id/151/500/300", tip: "Use 'Should have' for past regrets. Ex: 'I should have studied more for the final exam'." },
  { week: 7, title: "Cohesive Devices", image: "https://picsum.photos/id/161/500/300", tip: "Link ideas with 'However' or 'Therefore'. Ex: 'I am tired; however, I must finish this report'." },
  { week: 8, title: "Conditionals: Unless", image: "https://picsum.photos/id/171/500/300", tip: "Unless means 'except if'. Ex: 'I will go to the party unless I have to work late'." },
  { week: 9, title: "Past Perfect", image: "https://picsum.photos/id/181/500/300", tip: "Clarify which past action happened first. Ex: 'When I arrived, the train had already left'." },
  { week: 10, title: "Passive Voice", image: "https://picsum.photos/id/191/500/300", tip: "Focus on the object, not the person. Ex: 'The Mona Lisa was painted by Leonardo da Vinci'." },
  { week: 11, title: "Reported Speech", image: "https://picsum.photos/id/201/500/300", tip: "Change the tense when reporting. Ex: 'He said he was happy' (originally: 'I am happy')." },
  { week: 12, title: "General Review & B2 Prep", image: "https://picsum.photos/id/211/500/300", tip: "Combine narrative tenses and connectors. Ex: 'Although I was tired, I had finished my task'." },
];

const Tips: React.FC = () => {
  const renderCards = (tipsList: any[], sectionKey: string) => (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tipsList.map((t, i) => (
        <motion.div
          key={`${sectionKey}-${i}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          whileHover={{ y: -5 }}
          className="group flex flex-col rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10"
        >
          <div className="mb-6 flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-200">
            <img
              src={t.image}
              alt={t.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          
          <div className="flex flex-col flex-grow">
            <div className="mb-3 flex items-center gap-2">
              <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600">
                <Lightbulb size={14} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                WEEK {(i + 1).toString().padStart(2, '0')}
              </span>
            </div>
            
            <h3 className="mb-3 text-lg font-bold leading-tight text-slate-900 group-hover:text-blue-600">
              {t.title}
            </h3>
            
            {/* Se ha quitado la clase 'italic' aquí */}
            <p className="text-sm leading-relaxed text-slate-500 font-medium">
              {t.tip}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <SmartHeader />
      
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-24">
          <h1 className="text-4xl font-black text-slate-900 mb-8 border-l-4 border-blue-600 pl-4">A1 TIPS</h1>
          {renderCards(tipsA1, "a1")}
        </div>
        
        <div className="mb-24">
          <h1 className="text-4xl font-black text-slate-900 mb-8 border-l-4 border-blue-600 pl-4">A2 TIPS</h1>
          {renderCards(tipsA2, "a2")}
        </div>

        <div className="mb-24">
          <h1 className="text-4xl font-black text-slate-900 mb-8 border-l-4 border-blue-600 pl-4">B1 TIPS</h1>
          {renderCards(tipsB1, "b1")}
        </div>
      </div>
    </div>
  );
};

export default Tips;