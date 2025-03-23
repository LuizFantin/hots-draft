import { useState } from 'react';

interface ShareLinkProps {
  url: string;
  title: string;
}

export default function ShareLink({ url, title }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  return (
    <div>
      <p className="text-sm text-gray-300 mb-2">{title}</p>
      <div className="flex">
        <input
          type="text"
          readOnly
          value={url}
          className="flex-1 px-3 py-2 bg-gray-700 rounded-l-md border border-gray-600 focus:outline-none"
        />
        <button
          onClick={copyToClipboard}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-r-md transition-colors"
        >
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
    </div>
  );
}