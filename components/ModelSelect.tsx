import { OpenAIModel } from '@/types/types';
import { FC } from 'react';

interface Props {
  model: OpenAIModel;
  onChange: (value: OpenAIModel) => void;
  className?: string;
}

export const ModelSelect: FC<Props> = ({ model, onChange, className = '' }) => {
  const models: OpenAIModel[] = ['gpt-3.5-turbo', 'gpt-4'];

  return (
    <select
      value={model}
      onChange={(e) => onChange(e.target.value as OpenAIModel)}
      className={`${className}`}
    >
      {models.map((model) => (
        <option key={model} value={model}>
          {model}
        </option>
      ))}
    </select>
  );
};
