const mesesEs: Record<string, string> = {
  enero: '01',
  febrero: '02',
  marzo: '03',
  abril: '04',
  mayo: '05',
  junio: '06',
  julio: '07',
  agosto: '08',
  septiembre: '09',
  octubre: '10',
  noviembre: '11',
  diciembre: '12',
};

export function toISOFromEs(fecha: string, year?: number): string {
  const currentYear = year || new Date().getFullYear();
  
  // Normalize the string: remove extra spaces and convert to lowercase
  const normalized = fecha.trim().toLowerCase().replace(/\s+/g, ' ');
  
  // Extract day and month using regex
  const match = normalized.match(/^(\d{1,2})\s+de\s+(\w+)$/);
  
  if (!match) {
    throw new Error(`Formato de fecha inválido: ${fecha}. Use formato "DD de Mes"`);
  }
  
  const [, dayStr, monthName] = match;
  const day = dayStr.padStart(2, '0');
  const month = mesesEs[monthName];
  
  if (!month) {
    throw new Error(`Mes no reconocido: ${monthName}`);
  }
  
  return `${currentYear}-${month}-${day}`;
}