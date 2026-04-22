import { useState } from "react";
import { experience } from "../../../../Content/experience.js";

export default function ListExperience() {
  const [showMore, setShowMore] = useState({});
  const toggleShowMore = (id) => setShowMore((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <ol className="relative list-none max-w-full after:content-[''] after:absolute after:w-1 after:bg-[#fdc8b1] after:opacity-50 after:top-0 after:bottom-0 after:left-[17.5px] after:z-[1]">
      {experience.map((work) => {
        const isExpanded = showMore[work.id];
        const keys = Object.keys(work.description.responsibilities);
        const visible = isExpanded ? keys : keys.slice(0, 2);

        return (
          <li
            key={work.id}
            className="relative ml-12 max-[599px]:ml-10 pb-4 after:content-[''] after:absolute after:w-4 after:h-4 after:left-[-36px] after:bg-[var(--color-primary)] after:top-[15px] after:rounded-full after:z-[2] max-[599px]:after:left-[-28px]"
          >
            <div className="pb-4">
              <div className="sticky top-0 grid grid-cols-3 gap-20 max-[599px]:grid-cols-1 max-[599px]:gap-4">
                <div className="col-span-1 row-start-1">
                  <h3 className="text-[1.25rem] font-bold text-[var(--color-primary)]">{work.title}</h3>
                  <h4 className="text-[1.25rem] font-semibold text-[var(--LM-Title)] dark:text-[var(--DM-Title)]">{work.company}</h4>
                  <time className="text-[0.875rem] text-[rgba(255,255,255,0.8)]">{work.date}</time>
                </div>
                <div className="col-span-2 row-start-1 max-[599px]:col-span-1 max-[599px]:row-start-2">
                  <ul className="flex flex-col text-base leading-5">
                    {visible.map((key) => (
                      <li
                        key={key}
                        className="pl-5 list-none mb-1 before:content-['•'] before:text-[var(--color-primary)] before:ml-[-1.25rem] before:pr-[0.35rem] before:text-[1.25rem] before:font-bold"
                      >
                        {work.description.responsibilities[key]}
                      </li>
                    ))}
                    {keys.length > 2 && (
                      <button
                        onClick={() => toggleShowMore(work.id)}
                        className="mt-4 bg-transparent text-[var(--color-primary)] text-left font-bold border-none cursor-pointer p-0 w-auto"
                      >
                        {isExpanded ? "Ver menos" : "Saber más >"}
                      </button>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
