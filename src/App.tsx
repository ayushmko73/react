import { useState, useEffect, useCallback } from 'react';
import { Delete, Calculator, History, RotateCcw } from 'lucide-react';

export default function App() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isNewNumber, setIsNewNumber] = useState(true);

  const formatNumber = (num: string) => {
    if (num === 'Error') return num;
    if (num === '') return '';
    // Remove trailing dot for formatting if it exists momentarily
    const cleanNum = num.endsWith('.') ? num.slice(0, -1) : num;
    const parts = cleanNum.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.') + (num.endsWith('.') ? '.' : '');
  };

  const handleNumber = (num: string) => {
    if (display === 'Error') return;
    if (isNewNumber) {
      setDisplay(num);
      setIsNewNumber(false);
    } else {
      if (num === '.' && display.includes('.')) return;
      if (display.replace(/,/g, '').length >= 15) return; // Limit length
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    if (display === 'Error') return;
    const currentVal = display.replace(/,/g, '');
    setEquation(currentVal + ' ' + op + ' ');
    setIsNewNumber(true);
  };

  const calculate = () => {
    if (display === 'Error') return;
    if (!equation) return;

    const currentVal = display.replace(/,/g, '');
    const fullExpression = equation + currentVal;
    
    try {
      // eslint-disable-next-line no-new-func
      let result = new Function('return ' + fullExpression.replace(/×/g, '*').replace(/÷/g, '/'))();
      
      if (!isFinite(result) || isNaN(result)) {
        setDisplay('Error');
        setEquation('');
        setIsNewNumber(true);
        return;
      }

      // Fix floating point errors
      result = Math.round(result * 10000000000) / 10000000000;

      const resultStr = String(result);
      setHistory(prev => [fullExpression + ' = ' + resultStr, ...prev].slice(0, 10));
      setDisplay(resultStr);
      setEquation('');
      setIsNewNumber(true);
    } catch (e) {
      setDisplay('Error');
      setEquation('');
      setIsNewNumber(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
    setIsNewNumber(true);
  };

  const deleteLast = () => {
    if (display === 'Error') {
      clear();
      return;
    }
    if (isNewNumber) return;
    
    if (display.length === 1) {
      setDisplay('0');
      setIsNewNumber(true);
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key;
    if (/[0-9]/.test(key)) handleNumber(key);
    if (key === '.') handleNumber('.');
    if (['+', '-', '*', '/'].includes(key)) {
      const map: Record<string, string> = { '*': '×', '/': '÷', '+': '+', '-': '-' };
      handleOperator(map[key]);
    }
    if (key === 'Enter' || key === '=') {
      e.preventDefault();
      calculate();
    }
    if (key === 'Backspace') deleteLast();
    if (key === 'Escape') clear();
  }, [display, equation, isNewNumber]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const Button = ({ 
    text, 
    onClick, 
    className = '', 
    variant = 'default' 
  }: { 
    text: React.ReactNode, 
    onClick: () => void, 
    className?: string, 
    variant?: 'default' | 'operator' | 'action' | 'accent'
  }) => {
    const baseStyles = "h-16 w-16 md:h-20 md:w-20 rounded-full flex items-center justify-center text-2xl font-semibold transition-all active:scale-95 shadow-lg select-none";
    const variants = {
      default: "bg-gray-700 hover:bg-gray-600 text-white",
      operator: "bg-amber-500 hover:bg-amber-400 text-white",
      action: "bg-gray-400 hover:bg-gray-300 text-gray-900",
      accent: "bg-violet-600 hover:bg-violet-500 text-white"
    };
    
    return (
      <button onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`}>
        {text}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-800 relative">
        
        {/* Header / Top Bar */}
        <div className="flex justify-between items-center p-4 text-gray-400">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            <span className="text-xs font-medium uppercase tracking-wider">Standard</span>
          </div>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-full transition-colors ${showHistory ? 'text-amber-500 bg-gray-800' : 'hover:text-white'}`}
          >
            <History className="w-5 h-5" />
          </button>
        </div>

        {/* History Overlay */}
        {showHistory && (
          <div className="absolute top-16 left-0 right-0 bottom-0 bg-gray-900/95 backdrop-blur-sm z-10 p-6 overflow-y-auto animate-in fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-400 text-sm font-semibold uppercase">History</h3>
              <button onClick={() => setHistory([])} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            </div>
            {history.length === 0 ? (
              <p className="text-gray-600 text-center mt-10">No history yet</p>
            ) : (
              <div className="space-y-4">
                {history.map((item, idx) => (
                  <div key={idx} className="text-right border-b border-gray-800 pb-2">
                    <div className="text-gray-500 text-sm mb-1">{item.split(' = ')[0]}</div>
                    <div className="text-white text-xl font-medium">= {item.split(' = ')[1]}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Display */}
        <div className="px-6 py-8 flex flex-col items-end justify-end h-40 md:h-48 break-words">
          <div className="text-gray-400 text-lg md:text-xl h-6 mb-2 font-light tracking-wide">
            {equation.replace(/\*/g, '×').replace(/\//g, '÷')}
          </div>
          <div className="text-5xl md:text-6xl text-white font-light tracking-tight truncate w-full text-right">
             {formatNumber(display)}
          </div>
        </div>

        {/* Keypad */}
        <div className="p-6 pt-2">
          <div className="grid grid-cols-4 gap-4 md:gap-5">
            <Button text="AC" variant="action" onClick={clear} />
            <Button text={<Delete className="w-6 h-6" />} variant="action" onClick={deleteLast} />
            <Button text="%" variant="action" onClick={() => { /* Placeholder for % logic if needed, treating as op for now */ handleOperator('%')}} />
            <Button text="÷" variant="operator" onClick={() => handleOperator('÷')} />
            
            <Button text="7" onClick={() => handleNumber('7')} />
            <Button text="8" onClick={() => handleNumber('8')} />
            <Button text="9" onClick={() => handleNumber('9')} />
            <Button text="×" variant="operator" onClick={() => handleOperator('×')} />
            
            <Button text="4" onClick={() => handleNumber('4')} />
            <Button text="5" onClick={() => handleNumber('5')} />
            <Button text="6" onClick={() => handleNumber('6')} />
            <Button text="-" variant="operator" onClick={() => handleOperator('-')} />
            
            <Button text="1" onClick={() => handleNumber('1')} />
            <Button text="2" onClick={() => handleNumber('2')} />
            <Button text="3" onClick={() => handleNumber('3')} />
            <Button text="+" variant="operator" onClick={() => handleOperator('+')} />
            
            <Button text="0" className="col-span-2 w-full !rounded-full aspect-auto" onClick={() => handleNumber('0')} />
            <Button text="." onClick={() => handleNumber('.')} />
            <Button text="=" variant="operator" onClick={calculate} />
          </div>
        </div>
      </div>
    </div>
  );
}