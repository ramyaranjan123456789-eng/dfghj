import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';
import { Trash2, GripVertical, Loader2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PageItem {
  id: string;
  originalIndex: number;
  dataUrl: string;
}

function SortablePage({
  item,
  onRemove,
  index
}: {
  key?: string;
  item: PageItem;
  onRemove: (id: string) => void;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center relative group hover:shadow-md transition-shadow"
    >
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-100 hover:bg-red-500 hover:text-white text-slate-400 flex items-center justify-center transition-colors z-10 cursor-pointer"
        title="Delete Page"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      <div
        {...attributes}
        {...listeners}
        className="w-full aspect-[3/4] bg-slate-50 rounded-xl overflow-hidden mb-2 border border-slate-100 flex items-center justify-center cursor-grab active:cursor-grabbing relative"
      >
        <img src={item.dataUrl} alt="" className="w-full h-full object-contain pointer-events-none" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center transition-colors">
          <GripVertical className="w-6 h-6 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <span className="text-xs font-bold text-slate-600">Page {index + 1}</span>
    </div>
  );
}

export function Organize() {
  const [files, setFiles] = useState<File[]>([]);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();
  const toast = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFilesChange = async (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length === 0) {
      setPages([]);
      return;
    }

    setIsLoadingPages(true);
    try {
      const selectedFile = newFiles[0];
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      
      const numPages = pdf.numPages;
      const newPages: PageItem[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const scale = 0.4;
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          background: 'white'
        } as any).promise;

        newPages.push({
          id: `page-${i}-${Date.now()}`,
          originalIndex: i - 1,
          dataUrl: canvas.toDataURL('image/jpeg', 0.8)
        });
      }

      setPages(newPages);
    } catch (error) {
      console.error('Error loading PDF pages:', error);
      toast.error('Failed to load PDF pages.');
    } finally {
      setIsLoadingPages(false);
    }
  };

  const handleRemovePage = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleOrganize = async () => {
    if (files.length === 0 || pages.length === 0) return;

    setIsProcessing(true);
    const startTime = Date.now();

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer);
      const newDoc = await PDFDocument.create();

      const pageIndices = pages.map(p => p.originalIndex);
      const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);

      copiedPages.forEach((page) => {
        newDoc.addPage(page);
      });

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const duration = Date.now() - startTime;
      trackEvent('Organize PDF', 1, 'success', duration);

      navigate('/download', {
        state: {
          files: [{
            url,
            filename: file.name.replace('.pdf', '_organized.pdf'),
            size: blob.size
          }],
          action: 'organized'
        }
      });
    } catch (error) {
      console.error('Organize failed:', error);
      trackEvent('Organize PDF', 1, 'failed', Date.now() - startTime);
      toast.error('Failed to organize PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Organize PDF"
      subtitle="Sort pages of your PDF file however you like. Delete PDF pages or add PDF pages to your document at your convenience."
      selectButtonText="Select PDF file"
      multiple={false}
      files={files}
      onFilesChange={handleFilesChange}
      sidebarTitle="Organize PDF"
      infoMessage="Drag and drop pages to rearrange their order, or click the trash icon to delete unwanted pages."
      actionButtonText="Save Organized PDF"
      onAction={handleOrganize}
      isProcessing={isProcessing}
      isProcessingText="Saving organized PDF..."
      seoTitle="Organize PDF - Reorder, Rotate, Delete PDF pages"
      seoDescription="Sort and rearrange PDF pages in any sequence for free online."
      seoUrl="https://pdfloveyou.com/organize"
      customCanvasContent={
        isLoadingPages ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#E5322D] animate-spin mb-3" />
            <p className="text-sm font-bold text-slate-700">Loading document pages...</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={pages.map(p => p.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {pages.map((item, index) => (
                  <SortablePage
                    key={item.id}
                    item={item}
                    index={index}
                    onRemove={handleRemovePage}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )
      }
      customSidebarContent={
        <div className="space-y-3 text-xs text-slate-500">
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span>Remaining Pages:</span>
            <span className="font-bold text-slate-800">{pages.length}</span>
          </div>
        </div>
      }
    />
  );
}
