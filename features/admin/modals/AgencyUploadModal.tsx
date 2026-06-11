import React, { useState } from 'react';
import { Inmobiliaria } from '../../../types';

export const AgencyUploadModal: React.FC<{ isOpen: boolean; onClose: () => void; onUploadSuccess: (agencies: Omit<Inmobiliaria, 'id'>[]) => void; }> = ({ isOpen, onClose, onUploadSuccess }) => { 
    const [file, setFile] = useState<File | null>(null); 
    const [isProcessing, setIsProcessing] = useState(false); 
    const [error, setError] = useState<string | null>(null); 
    const [report, setReport] = useState<{ successCount: number; errors: string[] } | null>(null); 
    const resetState = () => { setFile(null); setIsProcessing(false); setError(null); setReport(null); }; 
    const handleClose = () => { resetState(); onClose(); }; 
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { resetState(); if (e.target.files && e.target.files.length > 0) { const selectedFile = e.target.files[0]; if (selectedFile.type !== "text/csv") { setError("Por favor, selecciona un archivo con formato .csv"); return; } setFile(selectedFile); } };
    const parseAgencyCSV = (csvText: string): { data: Omit<Inmobiliaria, 'id'>[], errors: string[] } => {
        const lines = csvText.trim().split(/\r\n|\n/); if (lines.length < 2) return { data: [], errors: ["El archivo está vacío o solo contiene la cabecera."] };
        const headers = lines[0].split(',').map(h => h.trim());
        const data: Omit<Inmobiliaria, 'id'>[] = []; const errors: string[] = [];
        const parseBoolean = (val?: string) => { const lowerVal = String(val).toLowerCase(); return lowerVal === 'true' || lowerVal === 'si' || lowerVal === 'sí' || lowerVal === '1' || lowerVal === 'verdadero' };
        lines.slice(1).forEach((line, index) => {
            if (!line.trim()) return; const values = line.split(','); const rowData: { [key: string]: string } = {};
            headers.forEach((header, headerIndex) => { rowData[header] = values[headerIndex] ? values[headerIndex].trim() : ''; });
            try {
                const score = parseInt(rowData.score, 10);
                const quejas = parseInt(rowData.quejas, 10);
                const googleRating = parseFloat(rowData.googleRating);
                const antiguedad = parseInt(rowData.antiguedad, 10);
                const newAgency: Omit<Inmobiliaria, 'id'> = { nombre: rowData.nombre || 'Sin Nombre', score: isNaN(score) ? 0 : score, quejas: isNaN(quejas) ? 0 : quejas, contrato: parseBoolean(rowData.contrato), googleRating: isNaN(googleRating) ? 0 : googleRating, miembroAMPI: parseBoolean(rowData.miembroAMPI), antiguedad: isNaN(antiguedad) ? 0 : antiguedad, rfcStatus: rowData.rfcStatus || 'N/A', domicilio: parseBoolean(rowData.domicilio), controversias: rowData.controversias || 'Ninguna', estado: rowData.estado || 'N/A', imageUrl: rowData.imageUrl || '' };
                data.push(newAgency);
            } catch (e) { errors.push(`Error fila ${index + 2}: ${e}`); }
        });
        return { data, errors };
    };
    const handleProcessFile = () => { if (!file) return; setIsProcessing(true); setError(null); setReport(null); const reader = new FileReader(); reader.onload = (event) => { try { const csvText = event.target?.result as string; const { data, errors } = parseAgencyCSV(csvText); if (data.length > 0) onUploadSuccess(data); setReport({ successCount: data.length, errors }); } catch (e) { setError(`Error inesperado: ${(e as Error).message}`); } finally { setIsProcessing(false); } }; reader.onerror = () => { setError("Error al leer archivo."); setIsProcessing(false); }; reader.readAsText(file); };
    if (!isOpen) return null; 
    return (<div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-[101]" onClick={handleClose}><div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl" onClick={e => e.stopPropagation()}>{!report ? (<><h3 className="text-2xl font-black mb-4">Carga Masiva</h3><input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-red-50 file:text-red-700 hover:file:bg-red-100 mb-4" />{error && <p className="text-red-600 mb-4">{error}</p>}<div className="flex justify-end gap-2"><button onClick={handleClose} className="px-4 py-2 bg-gray-100 rounded-full">Cancelar</button><button onClick={handleProcessFile} disabled={!file || isProcessing} className="px-4 py-2 bg-red-600 text-white rounded-full disabled:opacity-50">{isProcessing ? 'Procesando...' : 'Cargar'}</button></div></>) : (<div><h4 className="text-xl font-bold mb-2">Resultados</h4><p className="text-green-600">{report.successCount} éxitos.</p>{report.errors.length > 0 && <ul className="text-red-500 text-sm mt-2 max-h-40 overflow-y-auto">{report.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>}<button onClick={handleClose} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-full">Cerrar</button></div>)}</div></div>);
};
