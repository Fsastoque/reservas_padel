import type { Block } from '../types';
import { isBlockPast } from '../utils/datetime';

interface AvailabilityGridProps {
  blocks: Block[];
  date: string;
  selectedHour: number | null;
  onSelect: (hour: number) => void;
}

export const AvailabilityGrid = ({
  blocks,
  date,
  selectedHour,
  onSelect,
}: AvailabilityGridProps) => (
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
    {blocks.map((block) => {
      const reserved = block.status === 'reserved';
      const past = isBlockPast(date, block.hour);
      const selected = selectedHour === block.hour;
      const disabled = reserved || past;

      const stateClasses = reserved
        ? 'cursor-not-allowed border-line bg-ink/[0.04] text-ink/35'
        : past
          ? 'cursor-not-allowed border-line/70 bg-surface text-ink/30'
          : selected
            ? 'border-ink bg-ball text-ink shadow-court'
            : 'border-line bg-white text-ink hover:-translate-y-0.5 hover:border-court/50 hover:shadow-court';

      const label = reserved ? 'Reservado' : past ? 'Hora pasada' : selected ? 'Seleccionado' : 'Disponible';

      return (
        <button
          key={block.hour}
          type="button"
          disabled={disabled}
          aria-pressed={selected}
          onClick={() => onSelect(block.hour)}
          className={`flex flex-col items-start rounded-xl border p-3 text-left transition motion-reduce:transform-none motion-reduce:transition-none ${stateClasses}`}
        >
          <span className="font-display text-xl font-semibold leading-none">{block.startTime}</span>
          <span className="mt-1 text-[11px] leading-none text-current opacity-60">
            hasta {block.endTime}
          </span>
          <span className="mt-3 text-xs font-medium">{label}</span>
        </button>
      );
    })}
  </div>
);
