"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Camera, Pencil, ArrowClockwise, ArrowLeft } from "react-bootstrap-icons";

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
};

type PocketsPageProps = {
  pageId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
};

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

export function PocketsPage({ pageId, primaryColor, secondaryColor, accentColor }: PocketsPageProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [editing, setEditing] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tempPosition, setTempPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/binders/pages/${pageId}/decorations`)
      .then((r) => r.json())
      .then((data) => setDecorations(data))
      .catch(() => {});
  }, [pageId]);

  async function uploadImage(file: File) {
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
          type: "image",
          content: url,
          positionX: 50,
          positionY: 50,
          width: 15,
          height: 15,
          rotation: 0,
          shape: selectedShape,
          zIndex: decorations.length,
        }),
      });
      
      if (res.ok) {
        const newDeco = await res.json();
        setDecorations([...decorations, newDeco]);
        setSelectedShape(null);
        router.refresh();
      }
    } catch (err) {
      alert("Error al subir imagen");
    } finally {
      setLoading(false);
    }
  }

  async function updateDecoration(id: string, updates: Partial<Decoration>) {
    setLoading(true);
    try {
      const res = await fetch(`/api/binders/pages/decorations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setDecorations(decorations.map((d) => (d.id === id ? updated : d)));
        router.refresh();
      }
    } catch (err) {
      alert("Error al actualizar decoración");
    } finally {
      setLoading(false);
    }
  }

  async function deleteDecoration(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/binders/pages/decorations/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDecorations(decorations.filter((d) => d.id !== id));
        router.refresh();
      }
    } catch (err) {
      alert("Error al eliminar decoración");
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
        <div className="absolute top-0 right-0 z-50 bg-white/95 rounded-2xl p-4 shadow-2xl border-2" style={{ borderColor: accentColor }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Añadir Imagen</h3>
            <button
              onClick={() => setEditing(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="mb-2">
            <label className="text-xs text-gray-600 mb-1 block">Forma de recorte:</label>
            <select
              value={selectedShape || ""}
              onChange={(e) => setSelectedShape(e.target.value || null)}
              className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs mb-2"
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
              if (file) uploadImage(file);
            }}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full rounded-lg py-2 text-sm font-medium mb-2 disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              color: "white",
            }}
          >
            {loading ? "Subiendo..." : "📷 Subir Imagen"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="w-full rounded-lg bg-gray-200 py-1 text-sm"
          >
            Cerrar
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative rounded-3xl p-8 min-h-[700px] shadow-2xl border-4"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)`,
          borderColor: accentColor,
          boxShadow: `0 25px 70px ${primaryColor}30`,
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Estructura de bolsillos estilo macaroon mejorada */}
        <div className="grid grid-cols-2 gap-8 h-full">
          {/* Lado izquierdo */}
          <div className="space-y-4">
            {/* Bolsillos pequeños superiores con bordes sutiles */}
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4 border-2 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}25, ${secondaryColor}25)`,
                    borderColor: `${accentColor}40`,
                    minHeight: "100px",
                    boxShadow: `inset 0 2px 8px ${primaryColor}20`,
                  }}
                >
                  {/* Costura decorativa */}
                  <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ 
                    border: `1px solid ${accentColor}30`,
                    boxShadow: `inset 0 1px 2px ${primaryColor}30`,
                  }} />
                </div>
              ))}
            </div>
            {/* Bolsillo grande inferior con más detalle */}
            <div
              className="rounded-2xl p-6 border-2 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}25, ${secondaryColor}25)`,
                borderColor: `${accentColor}40`,
                minHeight: "250px",
                boxShadow: `inset 0 2px 8px ${primaryColor}20`,
              }}
            >
              <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ 
                border: `1px solid ${accentColor}30`,
                boxShadow: `inset 0 1px 2px ${primaryColor}30`,
              }} />
            </div>
            {/* Lazo para bolígrafo más estilizado */}
            <div className="flex justify-center">
              <div
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  borderColor: accentColor,
                  boxShadow: `0 2px 8px ${primaryColor}40`,
                }}
              >
                <div className="w-3 h-3 rounded-full" style={{ background: accentColor }} />
              </div>
            </div>
          </div>

          {/* Lado derecho */}
          <div className="space-y-4">
            {/* Bolsillo grande superior con cierre magnético */}
            <div
              className="rounded-2xl p-6 border-2 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}25, ${secondaryColor}25)`,
                borderColor: `${accentColor}40`,
                minHeight: "400px",
                boxShadow: `inset 0 2px 8px ${primaryColor}20`,
              }}
            >
              <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ 
                border: `1px solid ${accentColor}30`,
                boxShadow: `inset 0 1px 2px ${primaryColor}30`,
              }} />
              {/* Cierre magnético simulado más realista */}
              <div
                className="absolute top-4 right-4 w-20 h-10 rounded-xl border-2 flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  borderColor: accentColor,
                  boxShadow: `0 2px 8px ${primaryColor}40`,
                }}
              >
                <div className="w-3 h-3 rounded-full" style={{ background: accentColor }} />
              </div>
            </div>
          </div>
        </div>

        {/* Decoraciones (imágenes) con drag & drop */}
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
            >
            {decoration.type === "image" && (
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
                    >
                      <ArrowClockwise size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDecoration(decoration.id);
                      }}
                      className="bg-red-500 text-white rounded-full p-1 shadow-lg text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            )}
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
  );
}
