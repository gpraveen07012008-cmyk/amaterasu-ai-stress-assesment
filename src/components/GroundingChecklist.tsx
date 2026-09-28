import React, { useState } from 'react';

const groundingTasks = [
  {
    number: '5',
    color: 'bg-indigo-500/20 text-indigo-400',
    title: 'Notice 5 things you can SEE around you',
    description: 'A book, a beam of light on the floor, the texture of a desk, an object in the distance.'
  },
  {
    number: '4',
    color: 'bg-purple-500/20 text-purple-400',
    title: 'Notice 4 things you can physically FEEL',
    description: 'The soles of your feet against the floor, fabric of your shirt, cool air on your face.'
  },
  {
    number: '3',
    color: 'bg-cyan-500/20 text-cyan-400',
    title: 'Notice 3 things you can HEAR',
    description: 'Distant traffic, hum of a fan, birds chirping outside, your own breathing.'
  },
  {
    number: '2',
    color: 'bg-emerald-500/20 text-emerald-400',
    title: 'Notice 2 things you can SMELL',
    description: 'Fresh air, coffee aroma, scent of notebook paper or soap.'
  },
  {
    number: '1',
    color: 'bg-amber-500/20 text-amber-400',
    title: 'Notice 1 thing you can TASTE',
    description: 'Sip of cool water, lingering mint, or simply the presence of your own breath.'
  }
];

export const GroundingChecklist: React.FC = () => {
  const [completedTasks, setCompletedTasks] = useState<boolean[]>(groundingTasks.map(() => false));

  const toggleTask = (index: number) => {
    setCompletedTasks((current) => current.map((completed, taskIndex) => taskIndex === index ? !completed : completed));
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-sm">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">5-4-3-2-1 Sensory Grounding Technique</h3>
        <p className="text-xs text-slate-400">
          When racing thoughts take over, grounding brings your awareness directly back to your physical environment.
        </p>
      </div>

      <div className="space-y-3 text-xs sm:text-sm">
        {groundingTasks.map((task, index) => (
          <div key={task.number} className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
            <span className={`w-7 h-7 rounded-xl ${task.color} flex items-center justify-center font-bold text-sm shrink-0`}>
              {task.number}
            </span>
            <div className="flex-1">
              <b className="text-slate-200">{task.title}</b>
              <p className="text-slate-400 text-xs mt-0.5">{task.description}</p>
            </div>
            <label className="flex items-center gap-2 shrink-0 cursor-pointer text-[10px] font-semibold text-slate-300">
              <input
                type="checkbox"
                checked={completedTasks[index]}
                onChange={() => toggleTask(index)}
                aria-label={`${task.title}: ${completedTasks[index] ? 'completed' : 'not completed'}`}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-slate-900"
              />
              <span>{completedTasks[index] ? '✅ Completed' : '❌ Not completed'}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};