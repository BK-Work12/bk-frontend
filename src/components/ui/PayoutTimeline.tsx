type TimelineItem<TValue extends React.ReactNode = React.ReactNode> = {
  label: string;
  value: TValue;
};

type TimelineProps<TValue extends React.ReactNode = React.ReactNode> = {
  items: TimelineItem<TValue>[];
  className?: string;
};

export default function Timeline<TValue extends React.ReactNode = React.ReactNode>({
  items,
  className = '',
}: TimelineProps<TValue>) {
  return (
    <div className={`bg-black w-full ${className}`}>
      <div className="relative">
        <div className="absolute left-1.5 top-3 bottom-3 w-px bg-neutral-700" />

        <ul className="space-y-2.5">
          {items.map((item, index) => (
            <li key={index} className="flex w-full items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative z-10 h-2.5 w-2.5 rounded-full bg-[#262626]" />
                <span className="text-sm font-normal font-ui text-[#FFFFFFA3]">{item.label}</span>
              </div>

              <span className="text-sm font-normal font-ui text-[#FFFFFFA3]">{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
