import React, { useRef, useState, useEffect } from 'react';
import { Eraser } from 'lucide-react';

interface SignaturePadProps {
  onChange: (base64: string) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Ajusta o tamanho do canvas para corresponder ao tamanho de exibição (High DPI fix)
  useEffect(() => {
    let isMounted = true;
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

    const resizeCanvas = () => {
      if (!isMounted) return;
      
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        const rect = container.getBoundingClientRect();
        // Evita resize desnecessário se as dimensões não mudaram
        if (canvas.width === rect.width && canvas.height === rect.height) return;
        
        // Define a resolução interna igual ao tamanho de exibição CSS
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Re-inicializa contexto se necessário (opcional, limpa o canvas ao redimensionar)
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#0f172a';
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Pequeno delay para garantir que o modal terminou a animação de abertura
    resizeTimeout = setTimeout(resizeCanvas, 100);
    
    return () => {
        isMounted = false;
        window.removeEventListener('resize', resizeCanvas);
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
    };
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
       clientX = e.touches[0].clientX;
       clientY = e.touches[0].clientY;
    } else {
       clientX = (e as React.MouseEvent).clientX;
       clientY = (e as React.MouseEvent).clientY;
    }

    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    // Previne scroll em mobile
    if(e.nativeEvent.type === 'touchstart') {
        // Não prevenimos default aqui para permitir cliques, 
        // mas no touchmove prevenimos scroll
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    
    const { x, y } = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    // Importante: Previne scroll da tela enquanto desenha
    if (isDrawing && 'touches' in e) {
        e.preventDefault(); 
    }
    
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
        setIsDrawing(false);
        if (canvasRef.current && hasSignature) {
            onChange(canvasRef.current.toDataURL());
        }
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange('');
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div 
        ref={containerRef}
        className="border-2 border-dashed border-slate-300 rounded-lg bg-white overflow-hidden relative w-full h-48 sm:h-64 touch-none"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair block"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignature && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <span className="text-slate-400 text-sm">Assine aqui</span>
            </div>
        )}
      </div>
      <button
        type="button"
        onClick={clear}
        className="self-end text-xs text-red-400 flex items-center gap-1 hover:text-red-300 py-1 bg-red-500/5 px-2 rounded transition-colors"
      >
        <Eraser size={12} />
        Limpar Assinatura
      </button>
    </div>
  );
};

export default SignaturePad;