import React, { useState, useRef } from 'react';
import { Settings, Image as ImageIcon, Paintbrush, Grid, Minimize2, ImagePlus, Check, Monitor, LayoutGrid, Sparkles } from 'lucide-react';

export interface CanvasAppearance {
  backgroundType: 'color' | 'gradient' | 'image' | 'preset';
  backgroundColor: string;
  gradient?: string;
  image?: { url: string, display: 'fill' | 'fit' | 'tile', opacity: number, blur: number };
  grid: { show: boolean, type: 'dots' | 'lines' | 'cross', size: number, opacity: number, color: string, snap: boolean };
  advanced: { noise: boolean, shadows: boolean, theme: 'light' | 'dark' | 'auto' };
}

export const defaultAppearance: CanvasAppearance = {
  backgroundType: 'color',
  backgroundColor: '#ffffff',
  grid: { show: true, type: 'dots', size: 20, opacity: 1, color: '#94a3b8', snap: true },
  advanced: { noise: false, shadows: false, theme: 'light' }
};

interface AppearancePanelProps {
  appearance: CanvasAppearance;
  onChange: (appearance: CanvasAppearance) => void;
  onClose: () => void;
}

export function AppearancePanel({ appearance, onChange, onClose }: AppearancePanelProps) {
  const [activeTab, setActiveTab] = useState<'canvas' | 'grid' | 'advanced'>('canvas');
  
  const updateAppearance = (updates: Partial<CanvasAppearance>) => {
    onChange({ ...appearance, ...updates });
  };

  const updateGrid = (updates: Partial<CanvasAppearance['grid']>) => {
    onChange({ ...appearance, grid: { ...appearance.grid, ...updates } });
  };

  const updateAdvanced = (updates: Partial<CanvasAppearance['advanced']>) => {
    onChange({ ...appearance, advanced: { ...appearance.advanced, ...updates } });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to base64 webp
        const dataUrl = canvas.toDataURL('image/webp', 0.6);
        updateAppearance({ 
          backgroundType: 'image', 
          image: { url: dataUrl, display: 'fill', opacity: 100, blur: 0 } 
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[340px] bg-[#1E1E1E]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-4 duration-200">
      
      {/* Header Tabs */}
      <div className="flex border-b border-white/10">
        <button onClick={() => setActiveTab('canvas')} className={`flex-1 py-3 text-xs font-semibold tracking-wide transition-colors border-b-2 ${activeTab === 'canvas' ? 'text-indigo-400 border-indigo-400' : 'text-gray-400 border-transparent hover:text-gray-300'}`}>CANVAS</button>
        <button onClick={() => setActiveTab('grid')} className={`flex-1 py-3 text-xs font-semibold tracking-wide transition-colors border-b-2 ${activeTab === 'grid' ? 'text-indigo-400 border-indigo-400' : 'text-gray-400 border-transparent hover:text-gray-300'}`}>GRID</button>
        <button onClick={() => setActiveTab('advanced')} className={`flex-1 py-3 text-xs font-semibold tracking-wide transition-colors border-b-2 ${activeTab === 'advanced' ? 'text-indigo-400 border-indigo-400' : 'text-gray-400 border-transparent hover:text-gray-300'}`}>ADVANCED</button>
      </div>

      <div className="p-4 max-h-[400px] overflow-y-auto">
        
        {/* CANVAS TAB */}
        {activeTab === 'canvas' && (
          <div className="space-y-6">
            
            {/* Background Type */}
            <div className="flex bg-black/20 p-1 rounded-lg">
              <button onClick={() => updateAppearance({ backgroundType: 'color' })} className={`flex-1 py-1.5 text-xs rounded-md transition-colors ${appearance.backgroundType === 'color' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}>Color</button>
              <button onClick={() => updateAppearance({ backgroundType: 'gradient' })} className={`flex-1 py-1.5 text-xs rounded-md transition-colors ${appearance.backgroundType === 'gradient' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}>Gradient</button>
              <button onClick={() => updateAppearance({ backgroundType: 'image' })} className={`flex-1 py-1.5 text-xs rounded-md transition-colors ${appearance.backgroundType === 'image' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}>Image</button>
            </div>

            {appearance.backgroundType === 'color' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full border border-white/20 overflow-hidden shadow-inner shrink-0">
                    <input 
                      type="color" 
                      value={appearance.backgroundColor}
                      onChange={(e) => updateAppearance({ backgroundColor: e.target.value })}
                      className="absolute inset-[-10px] w-16 h-16 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">HEX</label>
                    <input 
                      type="text" 
                      value={appearance.backgroundColor.toUpperCase()}
                      onChange={(e) => updateAppearance({ backgroundColor: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block">Presets</label>
                  <div className="grid grid-cols-5 gap-2">
                    {['#ffffff', '#f8fafc', '#f3f4f6', '#eff6ff', '#f0fdf4', '#faf5ff', '#fefce8', '#121212', '#1e293b', '#0f172a'].map(c => (
                      <button
                        key={c}
                        onClick={() => updateAppearance({ backgroundColor: c })}
                        className={`h-8 rounded-md border shadow-sm transition-transform hover:scale-110 ${appearance.backgroundColor === c ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#1E1E1E]' : ''}`}
                        style={{ backgroundColor: c, borderColor: c === '#ffffff' ? '#444' : c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {appearance.backgroundType === 'gradient' && (
              <div className="space-y-4">
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block">Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
                    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                    'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
                    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
                    'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
                    'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)',
                  ].map(grad => (
                    <button
                      key={grad}
                      onClick={() => updateAppearance({ gradient: grad })}
                      className={`h-10 rounded-md border border-white/10 shadow-sm transition-transform hover:scale-105 ${appearance.gradient === grad ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#1E1E1E]' : ''}`}
                      style={{ background: grad }}
                    />
                  ))}
                </div>
              </div>
            )}

            {appearance.backgroundType === 'image' && (
              <div className="space-y-4">
                {!appearance.image?.url ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group">
                    <ImagePlus size={24} className="text-gray-400 group-hover:text-white mb-2" />
                    <span className="text-sm text-gray-400 group-hover:text-white">Click to upload image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                ) : (
                  <div className="space-y-3">
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/20 group">
                      <img src={appearance.image.url} alt="Background" className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <span className="text-sm font-medium text-white">Change Image</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                    
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block">Display</label>
                      <div className="flex bg-black/20 p-1 rounded-lg">
                        {['fill', 'fit', 'tile'].map(disp => (
                          <button 
                            key={disp}
                            onClick={() => updateAppearance({ image: { ...appearance.image!, display: disp as any } })} 
                            className={`flex-1 py-1 text-xs rounded-md capitalize transition-colors ${appearance.image!.display === disp ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}
                          >
                            {disp}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block flex justify-between">
                        <span>Opacity</span>
                        <span>{appearance.image.opacity}%</span>
                      </label>
                      <input 
                        type="range" min="0" max="100" 
                        value={appearance.image.opacity} 
                        onChange={e => updateAppearance({ image: { ...appearance.image!, opacity: Number(e.target.value) } })}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block flex justify-between">
                        <span>Blur</span>
                        <span>{appearance.image.blur}px</span>
                      </label>
                      <input 
                        type="range" min="0" max="20" 
                        value={appearance.image.blur} 
                        onChange={e => updateAppearance({ image: { ...appearance.image!, blur: Number(e.target.value) } })}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* GRID TAB */}
        {activeTab === 'grid' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Show Grid</span>
              <button 
                onClick={() => updateGrid({ show: !appearance.grid.show })}
                className={`w-10 h-5 rounded-full transition-colors relative ${appearance.grid.show ? 'bg-indigo-500' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${appearance.grid.show ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className={appearance.grid.show ? 'opacity-100 transition-opacity' : 'opacity-50 pointer-events-none transition-opacity'}>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block">Grid Type</label>
              <div className="flex bg-black/20 p-1 rounded-lg mb-4">
                {['dots', 'lines', 'cross'].map(type => (
                  <button 
                    key={type}
                    onClick={() => updateGrid({ type: type as any })} 
                    className={`flex-1 py-1.5 text-xs rounded-md capitalize transition-colors ${appearance.grid.type === type ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block flex justify-between">
                <span>Opacity</span>
                <span>{Math.round(appearance.grid.opacity * 100)}%</span>
              </label>
              <input 
                type="range" min="0" max="1" step="0.1"
                value={appearance.grid.opacity} 
                onChange={e => updateGrid({ opacity: Number(e.target.value) })}
                className="w-full accent-indigo-500 mb-4"
              />

              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block flex justify-between">
                <span>Size</span>
                <span>{appearance.grid.size}px</span>
              </label>
              <input 
                type="range" min="10" max="100" step="10"
                value={appearance.grid.size} 
                onChange={e => updateGrid({ size: Number(e.target.value) })}
                className="w-full accent-indigo-500 mb-4"
              />
              
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-full border border-white/20 overflow-hidden shadow-inner shrink-0">
                  <input 
                    type="color" 
                    value={appearance.grid.color}
                    onChange={(e) => updateGrid({ color: e.target.value })}
                    className="absolute inset-[-10px] w-12 h-12 cursor-pointer"
                  />
                </div>
                <span className="text-sm text-gray-300">Grid Color</span>
              </div>
            </div>
          </div>
        )}

        {/* ADVANCED TAB */}
        {activeTab === 'advanced' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-white block">Canvas Noise</span>
                <span className="text-xs text-gray-500 block">Add subtle grain texture</span>
              </div>
              <button 
                onClick={() => updateAdvanced({ noise: !appearance.advanced.noise })}
                className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${appearance.advanced.noise ? 'bg-indigo-500' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${appearance.advanced.noise ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
