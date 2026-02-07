"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  X, Camera, Pencil, ArrowClockwise, ArrowLeft, 
  Star, Heart, HeartFill, Stars, Flower3, Gift, 
  Moon, Palette, Rainbow, Gem, Mask, Bullseye,
  Plus
} from "react-bootstrap-icons";
import { Tent } from "lucide-react";

type Decoration = {
  id: string;
  type: "sticker" | "image" | "text";
  content: string;
  positionX: number;
  positionY: number;
  width?: number | null;
  height?: number | null;
  rotation: number;
  zIndex: number;
  shape?: string | null;
  fontSize?: number | null;
  fontColor?: string | null;
  fontFamily?: string | null;
};

type CoverPageProps = {
  pageId: string;
  binderId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  coverImageUrl?: string | null;
};

const STICKERS = [
  { icon: Star, name: "Estrella", iconName: "Star" },
  { icon: HeartFill, name: "Corazón", iconName: "HeartFill" },
  { icon: Stars, name: "Brillo", iconName: "Stars" },
  { icon: Flower3, name: "Flor", iconName: "Flower3" },
  { icon: Star, name: "Estrella", iconName: "Star" },
  { icon: Gift, name: "Regalo", iconName: "Gift" },
  { icon: Flower3, name: "Flor", iconName: "Flower3" },
  { icon: Moon, name: "Luna", iconName: "Moon" },
  { icon: HeartFill, name: "Corazón", iconName: "HeartFill" },
  { icon: Palette, name: "Paleta", iconName: "Palette" },
  { icon: Rainbow, name: "Arcoíris", iconName: "Rainbow" },
  { icon: Stars, name: "Brillo", iconName: "Stars" },
  { icon: Heart, name: "Corazón", iconName: "Heart" },
  { icon: Flower3, name: "Flor", iconName: "Flower3" },
  { icon: Mask, name: "Máscara", iconName: "Mask" },
  { icon: Gem, name: "Gema", iconName: "Gem" },
  { icon: Flower3, name: "Flor", iconName: "Flower3" },
  { icon: Gift, name: "Tienda", iconName: "Gift" },
  { icon: Flower3, name: "Flor", iconName: "Flower3" },
  { icon: Bullseye, name: "Objetivo", iconName: "Bullseye" },
];

const SHAPES = [
  { name: "Círculo", value: "circle" },
  { name: "Corazón", value: "heart" },
  { name: "Estrella", value: "star" },
  { name: "Cuadrado", value: "square" },
  { name: "Sin forma", value: null },
];

const HEART_PATH = "M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z";
const STAR_POLYGON = "50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%";
const HEART_CLIP_PATH = "path(\"" + HEART_PATH + "\")";

export function CoverPage({ pageId, binderId, primaryColor, secondaryColor, accentColor, coverImageUrl }: CoverPageProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [editing, setEditing] = useState(false);
  const [selectedDecoration, setSelectedDecoration] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tempPosition, setTempPosition] = useState<{ x: number; y: number } | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [stickerColor, setStickerColor] = useState("#FFD700");
  const [textColor, setTextColor] = useState(accentColor);
  const [textSize, setTextSize] = useState(24);
  const [textFont, setTextFont] = useState("Outfit");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [currentCoverImage, setCurrentCoverImage] = useState<string | null>(coverImageUrl ?? null);

  useEffect(() => {
    fetch(`/api/binders/pages/${pageId}/decorations`)
      .then((r) => r.json())
      .then((data) => setDecorations(data))
      .catch(() => {});
  }, [pageId]);

  useEffect(() => {
    setCurrentCoverImage(coverImageUrl || null);
  }, [coverImageUrl]);

  async function addSticker(sticker: { icon: any, name: string, iconName: string }) {
    setLoading(true);
    try {
      // Guardar el nombre del icono como identificador
      const res = await fetch(`/api/binders/pages/${pageId}/decorations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "sticker",
          content: sticker.iconName,
          positionX: 50,
          positionY: 50,
          width: 8,
          height: 8,
          rotation: 0,
          zIndex: decorations.length,
          fontColor: stickerColor, // Guardar el color del icono
        }),
      });
      if (res.ok) {
        const newDeco = await res.json();
        setDecorations((prev) => [...prev, newDeco]);
        setShowAddMenu(false);
      } else {
        const errorData = await res.json().catch(() => ({ error: "Error desconocido" }));
        alert(`Error al agregar sticker: ${errorData.error || "Error desconocido"}`);
      }
    } catch (err) {
      console.error("Error adding sticker:", err);
      alert("Error al agregar sticker");
    } finally {
      setLoading(false);
    }
  }

  async function addText() {
    if (!textInput.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/binders/pages/${pageId}/decorations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "text",
          content: textInput.trim(),
          positionX: 50,
          positionY: 50,
          fontSize: textSize,
          fontColor: textColor,
          fontFamily: textFont,
          zIndex: decorations.length,
        }),
      });
      if (res.ok) {
        const newDeco = await res.json();
        setDecorations((prev) => [...prev, newDeco]);
        setTextInput("");
        setShowAddMenu(false);
      } else {
        const errorData = await res.json().catch(() => ({ error: "Error desconocido" }));
        alert(`Error al agregar texto: ${errorData.error || "Error desconocido"}`);
      }
    } catch (err) {
      console.error("Error adding text:", err);
      alert("Error al agregar texto");
    } finally {
      setLoading(false);
    }
  }

  async function uploadImage(file: File, asSticker: boolean = false) {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!uploadRes.ok) {
        throw new Error("Error al subir imagen");
      }
      
      const { url } = await uploadRes.json();
      
      const res = await fetch(`/api/binders/pages/${pageId}/decorations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: asSticker ? "sticker" : "image",
          content: url,
          positionX: 50,
          positionY: 50,
          width: asSticker ? 15 : 20,
          height: asSticker ? 15 : 20,
          rotation: 0,
          shape: selectedShape,
          zIndex: decorations.length,
        }),
      });
      
      if (res.ok) {
        const newDeco = await res.json();
        setDecorations((prev) => [...prev, newDeco]);
        setSelectedShape(null);
        setShowAddMenu(false);
      } else {
        const errorData = await res.json().catch(() => ({ error: "Error desconocido" }));
        alert(`Error al subir imagen: ${errorData.error || "Error desconocido"}`);
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Error al subir imagen");
    } finally {
      setLoading(false);
    }
  }

  async function updateDecoration(id: string, updates: Partial<Decoration>) {
    // Actualización optimista: actualizar el estado inmediatamente
    setDecorations((prevDecorations) => 
      prevDecorations.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
    
    setLoading(true);
    try {
      const res = await fetch(`/api/binders/pages/decorations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        // Actualizar con la respuesta del servidor para asegurar sincronización
        setDecorations((prevDecorations) => 
          prevDecorations.map((d) => (d.id === id ? { ...d, ...updated } : d))
        );
      } else {
        // Si falla, revertir el cambio optimista y recargar
        const errorData = await res.json().catch(() => ({ error: "Error desconocido" }));
        console.error("Error updating decoration:", errorData);
        router.refresh();
      }
    } catch (err) {
      // Si falla, revertir el cambio optimista
      console.error("Error updating decoration:", err);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function deleteDecoration(id: string) {
    // Actualización optimista: eliminar del estado inmediatamente
    setDecorations((prevDecorations) => prevDecorations.filter((d) => d.id !== id));
    
    setLoading(true);
    try {
      const res = await fetch(`/api/binders/pages/decorations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        // Si falla, revertir el cambio optimista
        const errorData = await res.json().catch(() => ({ error: "Error desconocido" }));
        console.error("Error deleting decoration:", errorData);
        router.refresh();
      }
    } catch (err) {
      // Si falla, revertir el cambio optimista
      console.error("Error deleting decoration:", err);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function handleMouseDown(e: React.MouseEvent, decorationId: string) {
    if (!editing) return;
    e.stopPropagation();
    e.preventDefault();
    setDragging(decorationId);
    const decoration = decorations.find((d) => d.id === decorationId);
    if (!decoration || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setDragOffset({
      x: x - decoration.positionX,
      y: y - decoration.positionY,
    });
    setTempPosition({ x: decoration.positionX, y: decoration.positionY });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragging || !containerRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100 - dragOffset.x));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100 - dragOffset.y));
    
    setTempPosition({ x, y });
  }

  function handleMouseUp() {
    if (dragging && tempPosition) {
      updateDecoration(dragging, { positionX: tempPosition.x, positionY: tempPosition.y });
    }
    setDragging(null);
    setTempPosition(null);
  }

  function getShapeStyle(shape: string | null | undefined) {
    switch (shape) {
      case "circle":
        return { clipPath: "circle(50%)" };
      case "heart":
        return { clipPath: HEART_CLIP_PATH };
      case "star":
        return { clipPath: `polygon(${STAR_POLYGON})` };
      case "square":
        return { clipPath: "inset(0)" };
      default:
        return {};
    }
  }
  
  function getShapeClass(shape: string | null | undefined) {
    switch (shape) {
      case "circle":
        return "rounded-full";
      case "square":
        return "rounded-lg";
      default:
        return "rounded-lg";
    }
  }

  return (
    <div className="relative">
      {editing && (
        <div className="absolute top-0 right-0 z-50 bg-white/95 rounded-2xl p-4 shadow-2xl border-2 max-w-xs" style={{ borderColor: accentColor }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Decorar Portada</h3>
            <button
              onClick={() => {
                setEditing(false);
                setShowAddMenu(false);
                setSelectedDecoration(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          
          {!showAddMenu ? (
            <div className="space-y-2">
              <button
                onClick={() => setShowAddMenu(true)}
                className="w-full rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  color: "white",
                }}
              >
                <Plus size={16} /> Añadir Elemento
              </button>
              <button
                onClick={() => setEditing(false)}
                className="w-full rounded-lg bg-gray-200 py-1 text-sm"
              >
                Terminar Edición
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-medium mb-2">Pegatinas</h4>
                <div className="mb-2">
                  <label className="text-xs text-gray-600 mb-1 block">Color del icono:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={stickerColor}
                      onChange={(e) => setStickerColor(e.target.value)}
                      className="w-12 h-8 rounded-lg border-2 border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={stickerColor}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value && !value.startsWith("#")) {
                          value = "#" + value;
                        }
                        setStickerColor(value);
                      }}
                      className="flex-1 rounded-lg border border-gray-300 px-2 py-1 text-xs"
                      placeholder="#FFD700"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {STICKERS.map((sticker, index) => {
                    const IconComponent = sticker.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => addSticker(sticker)}
                        disabled={loading}
                        className="text-xl hover:scale-125 transition-transform disabled:opacity-50 p-2 rounded hover:bg-gray-100 flex items-center justify-center"
                        title={sticker.name}
                      >
                        <IconComponent size={24} style={{ color: stickerColor }} />
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-medium mb-2">Imagen como Pegatina</h4>
                <div className="mb-2">
                  <label className="text-xs text-gray-600 mb-1 block">Forma de recorte:</label>
                  <select
                    value={selectedShape || ""}
                    onChange={(e) => setSelectedShape(e.target.value || null)}
                    className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs"
                  >
                    {SHAPES.map((shape) => (
                      <option key={shape.value || "none"} value={shape.value || ""}>
                        {shape.name}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      uploadImage(file, true); // Subir como sticker
                      // Resetear el input
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="w-full rounded-lg py-2 text-sm font-medium disabled:opacity-50"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}80, ${secondaryColor}80)`,
                    color: accentColor,
                  }}
                >
                  {loading ? "Subiendo..." : (
                    <>
                      <Camera size={16} className="inline mr-1" /> Subir Imagen como Pegatina
                    </>
                  )}
                </button>
              </div>
              
              <div>
                <h4 className="text-xs font-medium mb-2">Texto</h4>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addText();
                  }}
                  placeholder="Escribe aquí..."
                  className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs mb-2"
                />
                <button
                  onClick={addText}
                  disabled={loading || !textInput.trim()}
                  className="w-full rounded-lg py-2 text-sm font-medium disabled:opacity-50"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}80, ${secondaryColor}80)`,
                    color: accentColor,
                  }}
                >
                  Agregar Texto
                </button>
              </div>
              
              <button
                onClick={() => setShowAddMenu(false)}
                className="w-full rounded-lg bg-gray-200 py-1 text-sm flex items-center justify-center gap-1"
              >
                <ArrowLeft size={14} /> Volver
              </button>
            </div>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className="relative rounded-3xl p-12 min-h-[700px] shadow-2xl border-4 cursor-move overflow-hidden"
        style={{
          background: currentCoverImage 
            ? `url(${currentCoverImage}) center/cover no-repeat, linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
            : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          borderColor: accentColor,
          boxShadow: `0 25px 70px ${primaryColor}40, inset 0 0 0 3px ${accentColor}30`,
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {currentCoverImage && (
          <div className="absolute inset-0 bg-black/20 z-0" />
        )}
        <div className="relative z-10">
          {/* Decoraciones */}
        {decorations.map((decoration) => {
          const isDragging = dragging === decoration.id;
          const displayX = isDragging && tempPosition ? tempPosition.x : decoration.positionX;
          const displayY = isDragging && tempPosition ? tempPosition.y : decoration.positionY;
          
          return (
            <div
              key={decoration.id}
              className={`absolute group ${isDragging ? "z-50 cursor-grabbing" : editing ? "cursor-move" : ""}`}
              style={{
                left: `${displayX}%`,
                top: `${displayY}%`,
                transform: `translate(-50%, -50%) rotate(${decoration.rotation}deg)`,
                width: decoration.width ? `${decoration.width}%` : "auto",
                height: decoration.height ? `${decoration.height}%` : "auto",
                zIndex: decoration.zIndex + (isDragging ? 1000 : 10),
                userSelect: "none",
              }}
              onMouseDown={(e) => {
                if (editing) handleMouseDown(e, decoration.id);
              }}
              onClick={(e) => {
                if (editing && !isDragging) {
                  e.stopPropagation();
                  setSelectedDecoration(decoration.id === selectedDecoration ? null : decoration.id);
                }
              }}
            >
            {decoration.type === "sticker" ? (
              <div className="relative">
                {/* Verificar si es emoji o imagen */}
                {decoration.content.startsWith("data:image") || decoration.content.startsWith("http") ? (
                  <img
                    src={decoration.content}
                    alt="Sticker"
                    className={`max-w-full max-h-32 object-cover shadow-xl border-2 ${getShapeClass(decoration.shape)}`}
                    style={{ 
                      borderColor: accentColor,
                      ...getShapeStyle(decoration.shape),
                    }}
                  />
                ) : (
                  <div 
                    className="drop-shadow-lg inline-block"
                    style={{ 
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                    }}
                  >
                    {(() => {
                      const iconMap: { [key: string]: any } = {
                        "Star": Star,
                        "HeartFill": HeartFill,
                        "Stars": Stars,
                        "Flower3": Flower3,
                        "Gift": Gift,
                        "Moon": Moon,
                        "Palette": Palette,
                        "Rainbow": Rainbow,
                        "Heart": Heart,
                        "Mask": Mask,
                        "Gem": Gem,
                        "Tent": Gift,
                        "Bullseye": Bullseye,
                      };
                      const IconComponent = iconMap[decoration.content] || Star;
                      const iconColor = decoration.fontColor || accentColor;
                      return <IconComponent size={48} color={iconColor} />;
                    })()}
                  </div>
                )}
                {editing && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newRotation = decoration.rotation + 15;
                        updateDecoration(decoration.id, { rotation: newRotation });
                      }}
                      className="bg-white rounded-full p-1 shadow-lg text-xs"
                      title="Rotar"
                    >
                      <ArrowClockwise size={14} />
                    </button>
                    {selectedDecoration === decoration.id && (
                      <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-xl border-2 z-50" style={{ borderColor: accentColor }}>
                        <div className="space-y-2 min-w-[200px]">
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Color del icono:</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={decoration.fontColor || accentColor}
                                onChange={(e) => updateDecoration(decoration.id, { fontColor: e.target.value })}
                                className="w-10 h-8 rounded border cursor-pointer"
                              />
                              <input
                                type="text"
                                value={decoration.fontColor || accentColor}
                                onChange={(e) => {
                                  let value = e.target.value;
                                  if (value && !value.startsWith("#")) {
                                    value = "#" + value;
                                  }
                                  updateDecoration(decoration.id, { fontColor: value });
                                }}
                                className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDecoration(decoration.id === selectedDecoration ? null : decoration.id);
                      }}
                      className="bg-blue-500 text-white rounded-full p-1 shadow-lg text-xs"
                      title="Editar color"
                    >
                      <Palette size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDecoration(decoration.id);
                      }}
                      className="bg-red-500 text-white rounded-full p-1 shadow-lg text-xs"
                      title="Eliminar"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            ) : decoration.type === "image" ? (
              <div className="relative">
                <img
                  src={decoration.content}
                  alt="Decoración"
                  className={`max-w-full max-h-48 object-cover shadow-xl border-2 ${getShapeClass(decoration.shape)}`}
                  style={{ 
                    borderColor: accentColor,
                    ...getShapeStyle(decoration.shape),
                  }}
                />
                {editing && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newRotation = decoration.rotation + 15;
                        updateDecoration(decoration.id, { rotation: newRotation });
                      }}
                      className="bg-white rounded-full p-1 shadow-lg text-xs"
                      title="Rotar"
                    >
                      <ArrowClockwise size={14} />
                    </button>
                    {selectedDecoration === decoration.id && (
                      <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-xl border-2 z-50" style={{ borderColor: accentColor }}>
                        <div className="space-y-2 min-w-[200px]">
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Color del icono:</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={decoration.fontColor || accentColor}
                                onChange={(e) => updateDecoration(decoration.id, { fontColor: e.target.value })}
                                className="w-10 h-8 rounded border cursor-pointer"
                              />
                              <input
                                type="text"
                                value={decoration.fontColor || accentColor}
                                onChange={(e) => {
                                  let value = e.target.value;
                                  if (value && !value.startsWith("#")) {
                                    value = "#" + value;
                                  }
                                  updateDecoration(decoration.id, { fontColor: value });
                                }}
                                className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDecoration(decoration.id === selectedDecoration ? null : decoration.id);
                      }}
                      className="bg-blue-500 text-white rounded-full p-1 shadow-lg text-xs"
                      title="Editar color"
                    >
                      <Palette size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDecoration(decoration.id);
                      }}
                      className="bg-red-500 text-white rounded-full p-1 shadow-lg text-xs"
                      title="Eliminar"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            ) : decoration.type === "text" ? (
              <div className="relative">
                <p
                  className="font-display font-bold drop-shadow-lg whitespace-nowrap"
                  style={{
                    fontSize: `${decoration.fontSize || 24}px`,
                    color: decoration.fontColor || accentColor,
                    fontFamily: decoration.fontFamily || "Outfit",
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    fontWeight: "bold",
                    letterSpacing: "0.5px",
                  }}
                >
                  {decoration.content}
                </p>
                {editing && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newRotation = decoration.rotation + 15;
                        updateDecoration(decoration.id, { rotation: newRotation });
                      }}
                      className="bg-white rounded-full p-1 shadow-lg text-xs"
                      title="Rotar"
                    >
                      <ArrowClockwise size={14} />
                    </button>
                    {selectedDecoration === decoration.id && (
                      <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-xl border-2 z-50" style={{ borderColor: accentColor }}>
                        <div className="space-y-2 min-w-[200px]">
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Color:</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={decoration.fontColor || accentColor}
                                onChange={(e) => updateDecoration(decoration.id, { fontColor: e.target.value })}
                                className="w-10 h-8 rounded border cursor-pointer"
                              />
                              <input
                                type="text"
                                value={decoration.fontColor || accentColor}
                                onChange={(e) => {
                                  let value = e.target.value;
                                  if (value && !value.startsWith("#")) {
                                    value = "#" + value;
                                  }
                                  updateDecoration(decoration.id, { fontColor: value });
                                }}
                                className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Tamaño: {decoration.fontSize || 24}px</label>
                            <input
                              type="range"
                              min="12"
                              max="72"
                              value={decoration.fontSize || 24}
                              onChange={(e) => updateDecoration(decoration.id, { fontSize: Number(e.target.value) })}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Fuente:</label>
                            <select
                              value={decoration.fontFamily || "Outfit"}
                              onChange={(e) => updateDecoration(decoration.id, { fontFamily: e.target.value })}
                              className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                            >
                              <option value="Outfit">Outfit</option>
                              <option value="DM Sans">DM Sans</option>
                              <option value="Arial">Arial</option>
                              <option value="Georgia">Georgia</option>
                              <option value="Times New Roman">Times New Roman</option>
                              <option value="Courier New">Courier New</option>
                              <option value="Verdana">Verdana</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDecoration(decoration.id === selectedDecoration ? null : decoration.id);
                      }}
                      className="bg-blue-500 text-white rounded-full p-1 shadow-lg text-xs"
                      title="Editar estilo"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDecoration(decoration.id);
                      }}
                      className="bg-red-500 text-white rounded-full p-1 shadow-lg text-xs"
                      title="Eliminar"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            ) : null}
            </div>
          );
        })}

          {/* Botón para editar */}
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="absolute top-6 right-6 bg-white/90 rounded-full p-3 shadow-xl hover:bg-white transition-all hover:scale-110 z-20"
              style={{ color: accentColor }}
            >
              <Pencil size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
