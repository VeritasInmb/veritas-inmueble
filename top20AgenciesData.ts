import { Inmobiliaria } from './types';

const agencyNames = [
    "Century 21 México",
    "RE/MAX México",
    "Coldwell Banker México",
    "Keller Williams (KW) México",
    "Realty World México",
    "Tecnocasa México",
    "Alfa Inmobiliaria",
    "Quality Inmobiliaria",
    "Sotheby's International Realty México",
    "Realty Plus México",
    "Engel & Völkers México",
    "Rent-A-House México",
    "Neximo (iad México)",
    "The Agency Mexico",
    "Berkshire Hathaway HomeServices Mexico Properties",
    "CBRE México",
    "JLL (Jones Lang LaSalle) México",
    "Colliers International México",
    "Cushman & Wakefield México",
    "Newmark México"
];

export const top20AgenciesData: Omit<Inmobiliaria, 'id'>[] = agencyNames.map(name => ({
    nombre: name,
    score: 0,
    verificada: false,
    quejas: 0,
    contrato: false,
    googleRating: 0,
    miembroAMPI: false,
    antiguedad: 0,
    rfcStatus: "Pendiente de verificación",
    domicilio: false,
    controversias: "Sin registro auditable aún",
    estado: "No definido",
    resenas: [],
    imageUrl: "" // They can add logos later
}));
