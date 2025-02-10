interface Props {
  apiKey: string;
  onChange: (value: string) => void;
  className?: string;
}

export const APIKeyInput: React.FC<Props> = ({ apiKey, onChange, className }) => {
  return (
    <input
      type="password"
      value={apiKey}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-lg border border-gray-700 bg-[#1F2937] px-4 py-2 text-neutral-200 ${className}`}
      placeholder="Enter your OpenAI API key"
    />
  );
};
