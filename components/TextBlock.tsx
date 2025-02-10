import { FC } from 'react';

interface Props {
  text: string;
  editable?: boolean;
  onChange?: (value: string) => void;
  className?: string;
}

export const TextBlock: FC<Props> = ({
  text,
  editable = false,
  onChange = () => {},
  className = '',
}) => {
  return (
    <textarea
      className={`w-full h-full resize-none bg-[#0E1117] p-4 text-neutral-200 focus:outline-none ${className}`}
      value={text}
      onChange={(e) => onChange(e.target.value)}
      readOnly={!editable}
      placeholder={
        editable
          ? 'Enter text here...'
          : 'Output will appear here...'
      }
    />
  );
};
