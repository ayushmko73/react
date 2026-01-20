import { useState } from 'react';
import { Delete, Equal, Calculator } from 'lucide-react';

export default function App() {
  const [current, setCurrent] = useState('0');
  const [previous, setPrevious] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState(false);

  const formatNumber = (numStr: string) => {
    if (numStr === 'Error') return 'Error';
    if (numStr.endsWith('.')) return numStr;
    const [integer, decimal] = numStr.split('.');
    if (decimal) return `${parseInt(integer).toLocaleString()}.${decimal}`;
    return parseInt(integer).toLocaleString();
  };

  const handleNumber = (number: string) => {
    if (current === 'Error') {
      setCurrent(number);
      return;
    }
    if (overwrite) {
      setCurrent(number);
      setOverwrite(false);
    } else {
      if (number === '0' && current === '0') return;
      if (number === '.' && current.includes('.')) return;
      setCurrent(current === '0' && number !== '.' ? number : current + number);
    }
  };

  const handleOperator = (op: string) => {
    if (current === 'Error') return;
    if (previous === null) {
      setPrevious(current);
      setOperation(op);
      setOverwrite(true);
    } else if (operation) {
      const result = calculate(previous, current, operation);
      setPrevious(result);
      setCurrent(result);
      setOperation(op);
      setOverwrite(true);
    }
  };

  const calculate = (prev: string, curr: string, op: string): string => {
    const prevNum = parseFloat(prev);
    const currNum = parseFloat(curr);
    if (isNaN(prevNum) || isNaN(currNum)) return 'Error';

    let computation = 0;
    switch (op) {
      case '+':
        computation = prevNum + currNum;
        break;
      case '-':
        computation = prevNum - currNum;
        break;
      case '*':
        computation = prevNum * currNum;
        break;
      case '/':
        if (currNum === 0) return 'Error';
        computation = prevNum / currNum;
        break;
      default:
        return curr;
    }
    // Limit decimals to avoid floating point ugliness
    return Math.round(computation * 100000000) / 100000000 + '';
  };

  const handleEqual = () => {
    if (operation && previous) {
      const result = calculate(previous, current, operation);
      setCurrent(result);
      setPrevious(null);
      setOperation(null);
      setOverwrite(true);
    }
  };

  const clear = () => {
    setCurrent('0');
    setPrevious(null);
    setOperation(null);
    setOverwrite(false);
  };

  const deleteLast = () => {
    if (overwrite) {
      setCurrent('0');
      setOverwrite(false);
      return;
    }
    if (current === 'Error') {
      clear();
      return;
    }
    if (current.length === 1) {
      setCurrent('0');
    } else {
      setCurrent(current.slice(0, -1));
    }
  };

  const buttons = [
    { label: 'C', onClick: clear, className: 'bg-red-500 text-white hover:bg-red-600 col-span-2' },
    { label: <Delete size={20} />, onClick: deleteLast, className: 'bg-gray-200 hover:bg-gray-300 text-gray-800' },
    { label: '÷', onClick: () => handleOperator('/'), className: 'bg-indigo-500 text-white hover:bg-indigo-600' },
    { label: '7', onClick: () => handleNumber('7'), className: 'bg-gray-100 hover:bg-gray-200 text-gray-800' },
    { label: '8', onClick: () => handleNumber('8'), className: 'bg-gray-100 hover:bg-gray-200 text-gray-800' },
    { label: '9', onClick: () => handleNumber('9'), className: 'bg-gray-100 hover:bg-gray-200 text-gray-800' },
    { label: '×', onClick: () => handleOperator('*'), className: 'bg-indigo-500 text-white hover:bg-indigo-600' },
    { label: '4', onClick: () => handleNumber('4'), className: 'bg-gray-100 hover:bg-gray-200 text-gray-800' },
    { label: '5', onClick: () => handleNumber('5'), className: 'bg-gray-100 hover:bg-gray-200 text-gray-800' },
    { label: '6', onClick: () => handleNumber('6'), className: 'bg-gray-100 hover:bg-gray-200 text-gray-800' },
    { label: '-', onClick: () => handleOperator('-'), className: 'bg-indigo-500 text-white hover:bg-indigo-600' },
    { label: '1', onClick: () => handleNumber('1'), className: 'bg-gray-100 hover:bg-gray-200 text-gray-800' },
    { label: '2', onClick: () => handleNumber('2'), className: 'bg-gray-100 hover:bg-gray-200 text-gray-800' },
    { label: '3', onClick: () => handleNumber('3'), className: 'bg-gray-100 hover:bg-gray-200 text-gray-800' },
    { label: '+', onClick: () => handleOperator('+'), className: 'bg-indigo-500 text-white hover:bg-indigo-600' },
    { label: '0', onClick: () => handleNumber('0'), className: 'bg-gray-100 hover:bg-gray-200 text-gray-800 col-span-2' },
    { label: '.', onClick: () => handleNumber('.'), className: 'bg-gray-100 hover:bg-gray-200 text-gray-800' },
    { label: <Equal size={20} />, onClick: handleEqual, className: 'bg-indigo-600 text-white hover:bg-indigo-700' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-indigo-600 text-white flex items-center gap-2">
            <Calculator size={20} />
            <span className="font-bold">Calculator</span>
        </div>

        {/* Display */}
        <div className="bg-gray-900 p-6 text-right">
          <div className="text-gray-400 text-sm h-6 font-mono">
            {previous} {operation}
          </div>
          <div className="text-white text-4xl font-mono truncate">
            {formatNumber(current)}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-px bg-gray-200 border-t border-gray-200">
          {buttons.map((btn, index) => (
            <button
              key={index}
              onClick={btn.onClick}
              className={`h-16 flex items-center justify-center text-xl font-medium transition-colors outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 ${btn.className}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}