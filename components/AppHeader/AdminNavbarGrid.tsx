import { Menu } from '@headlessui/react';

interface AdminNavbarGridProps {
  numCols?: number;
  sectionTitle: string;
  options: Array<{
    optionName: string;
    onClick: () => void;
  }>;
}

export default function AdminNavbarGrid({
  sectionTitle,
  options,
  numCols = 3,
}: AdminNavbarGridProps) {
  const gridColsClass =
    numCols === 2 ? 'grid-cols-2' : numCols === 1 ? 'grid-cols-1' : 'grid-cols-3';

  return (
    <div className="bg-gray-100 p-2 h-full">
      <h1 className="px-2 mb-2 text-sm font-semibold text-[#5D5A88]">{sectionTitle}</h1>
      <div className={`grid ${gridColsClass} gap-2`}>
        {options.map((option) => (
          <Menu.Item key={option.optionName}>
            {({ active }) => (
              <button
                className={`${
                  active ? 'bg-[#EAE6F2]' : 'text-[#5D5A88]'
                } group flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-medium text-center whitespace-normal break-words leading-snug min-h-[3rem]`}
                onClick={() => option.onClick()}
              >
                {option.optionName}
              </button>
            )}
          </Menu.Item>
        ))}
      </div>
    </div>
  );
}
