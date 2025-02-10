import { APIKeyInput } from '@/components/APIKeyInput';
import { CodeBlock } from '@/components/CodeBlock';
import { LanguageSelect } from '@/components/LanguageSelect';
import { ModelSelect } from '@/components/ModelSelect';
import { TextBlock } from '@/components/TextBlock';
import { OpenAIModel, TranslateBody } from '@/types/types';
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function Home() {
  const [inputLanguage, setInputLanguage] = useState<string>('JavaScript');
  const [outputLanguage, setOutputLanguage] = useState<string>('Python');
  const [inputCode, setInputCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [model, setModel] = useState<OpenAIModel>('gpt-3.5-turbo');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasTranslated, setHasTranslated] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');

  const handleTranslate = async () => {
    const maxCodeLength = model === 'gpt-3.5-turbo' ? 6000 : 12000;

    if (!apiKey) {
      alert('Please enter an API key.');
      return;
    }

    if (inputLanguage === outputLanguage) {
      alert('Please select different languages.');
      return;
    }

    if (!inputCode) {
      alert('Please enter some code.');
      return;
    }

    if (inputCode.length > maxCodeLength) {
      alert(
        `Please enter code less than ${maxCodeLength} characters. You are currently at ${inputCode.length} characters.`,
      );
      return;
    }

    setLoading(true);
    setOutputCode('');

    const controller = new AbortController();

    const body: TranslateBody = {
      inputLanguage,
      outputLanguage,
      inputCode,
      model,
      apiKey,
    };

    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      setLoading(false);
      alert('Something went wrong.');
      return;
    }

    const data = response.body;

    if (!data) {
      setLoading(false);
      alert('Something went wrong.');
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let code = '';

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      code += chunkValue;

      setOutputCode((prevCode) => prevCode + chunkValue);
    }

    setLoading(false);
    setHasTranslated(true);
    copyToClipboard(code);
  };

  const copyToClipboard = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);

    localStorage.setItem('apiKey', value);
  };

  useEffect(() => {
    if (hasTranslated) {
      handleTranslate();
    }
  }, [outputLanguage]);

  useEffect(() => {
    const apiKey = localStorage.getItem('apiKey');

    if (apiKey) {
      setApiKey(apiKey);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Code Translator</title>
        <meta
          name="description"
          content="Use AI to translate code from one language to another."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-screen flex-col items-center bg-[#0E1117] px-4 py-6 text-neutral-200">
        <div className="mt-4 flex flex-col items-center justify-center sm:mt-6">
          <h1 className="bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-4xl font-bold text-transparent">
            AI Code Translator
          </h1>
          <p className="mt-3 text-base text-gray-400">
            Translate code between programming languages instantly
          </p>
        </div>

        <div className="mt-6 flex w-full max-w-xl justify-center">
          <div className="w-full text-center">
            <APIKeyInput 
              apiKey={apiKey} 
              onChange={handleApiKeyChange}
              className="w-full max-w-md mx-auto"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <ModelSelect 
            model={model} 
            onChange={(value) => setModel(value)}
            className="w-48 rounded-lg border border-gray-700 bg-[#1F2937] p-2"
          />
          <button
            className="w-48 rounded-lg bg-violet-500 px-4 py-2 font-medium text-white transition-all hover:bg-violet-600 active:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => handleTranslate()}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Translating...
              </span>
            ) : (
              'Translate'
            )}
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          {loading
            ? 'Translating...'
            : hasTranslated
            ? 'Output copied to clipboard!'
            : 'Enter some code and click "Translate"'}
        </div>

        <div className="mt-6 flex w-full max-w-[1200px] flex-1 flex-col space-y-6 sm:flex-row sm:space-x-8 sm:space-y-0">
          <div className="flex flex-1 flex-col rounded-xl bg-[#1F2937] p-5 shadow-lg ring-1 ring-gray-700">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Input</h2>
              <LanguageSelect
                language={inputLanguage}
                onChange={(value) => {
                  setInputLanguage(value);
                  setHasTranslated(false);
                  setInputCode('');
                  setOutputCode('');
                }}
                className="rounded-lg border border-gray-700 bg-[#374151] p-1.5"
              />
            </div>
            <div className="flex-1 overflow-hidden rounded-lg border border-gray-700 bg-[#0E1117]">
              {inputLanguage === 'Natural Language' ? (
                <TextBlock
                  text={inputCode}
                  editable={!loading}
                  onChange={(value) => {
                    setInputCode(value);
                    setHasTranslated(false);
                  }}
                  className="h-[280px]"
                />
              ) : (
                <CodeBlock
                  code={inputCode}
                  editable={!loading}
                  onChange={(value) => {
                    setInputCode(value);
                    setHasTranslated(false);
                  }}
                  className="h-[280px]"
                />
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col rounded-xl bg-[#1F2937] p-5 shadow-lg ring-1 ring-gray-700">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Output</h2>
              <LanguageSelect
                language={outputLanguage}
                onChange={(value) => {
                  setOutputLanguage(value);
                  setOutputCode('');
                }}
                className="rounded-lg border border-gray-700 bg-[#374151] p-1.5"
              />
            </div>
            <div className="flex-1 overflow-hidden rounded-lg border border-gray-700 bg-[#0E1117]">
              {outputLanguage === 'Natural Language' ? (
                <TextBlock 
                  text={outputCode}
                  className="h-[280px]"
                />
              ) : (
                <CodeBlock 
                  code={outputCode}
                  className="h-[280px]"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}