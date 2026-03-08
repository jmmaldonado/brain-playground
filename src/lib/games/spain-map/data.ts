export interface Region {
  id: string;
  name: string;
  capital?: string;
  communityId?: string;
}

export const communities = [
  { id: 'ESAN', name: 'Andalucía' },
  { id: 'ESAR', name: 'Aragón' },
  { id: 'ESAS', name: 'Asturias' },
  { id: 'ESIB', name: 'Islas Baleares' },
  { id: 'ESCB', name: 'Cantabria' },
  { id: 'ESCL', name: 'Castilla y León' },
  { id: 'ESCM', name: 'Castilla-La Mancha' },
  { id: 'ESCT', name: 'Cataluña' },
  { id: 'ESVC', name: 'Comunidad Valenciana' },
  { id: 'ESEX', name: 'Extremadura' },
  { id: 'ESGA', name: 'Galicia' },
  { id: 'ESMD', name: 'Comunidad de Madrid' },
  { id: 'ESMC', name: 'Región de Murcia' },
  { id: 'ESNC', name: 'Navarra' },
  { id: 'ESPV', name: 'País Vasco' },
  { id: 'ESRI', name: 'La Rioja' },
  { id: 'ESCE', name: 'Ceuta' },
  { id: 'ESML', name: 'Melilla' }
];

export const provinces: Region[] = [
  // Andalucía
  { id: 'ESAL', name: 'Almería', capital: 'Almería', communityId: 'ESAN' },
  { id: 'ESCA', name: 'Cádiz', capital: 'Cádiz', communityId: 'ESAN' },
  { id: 'ESCO', name: 'Córdoba', capital: 'Córdoba', communityId: 'ESAN' },
  { id: 'ESGR', name: 'Granada', capital: 'Granada', communityId: 'ESAN' },
  { id: 'ESH', name: 'Huelva', capital: 'Huelva', communityId: 'ESAN' },
  { id: 'ESJ', name: 'Jaén', capital: 'Jaén', communityId: 'ESAN' },
  { id: 'ESMA', name: 'Málaga', capital: 'Málaga', communityId: 'ESAN' },
  { id: 'ESSE', name: 'Sevilla', capital: 'Sevilla', communityId: 'ESAN' },
  
  // Aragón
  { id: 'ESHU', name: 'Huesca', capital: 'Huesca', communityId: 'ESAR' },
  { id: 'ESTE', name: 'Teruel', capital: 'Teruel', communityId: 'ESAR' },
  { id: 'ESZ', name: 'Zaragoza', capital: 'Zaragoza', communityId: 'ESAR' },
  
  // Asturias
  { id: 'ESO', name: 'Asturias', capital: 'Oviedo', communityId: 'ESAS' },
  
  // Baleares
  { id: 'ESPM', name: 'Baleares', capital: 'Palma de Mallorca', communityId: 'ESIB' },
  
  // Cantabria
  { id: 'ESS', name: 'Cantabria', capital: 'Santander', communityId: 'ESCB' },
  
  // Castilla y León
  { id: 'ESAV', name: 'Ávila', capital: 'Ávila', communityId: 'ESCL' },
  { id: 'ESBU', name: 'Burgos', capital: 'Burgos', communityId: 'ESCL' },
  { id: 'ESLE', name: 'León', capital: 'León', communityId: 'ESCL' },
  { id: 'ESP', name: 'Palencia', capital: 'Palencia', communityId: 'ESCL' },
  { id: 'ESSA', name: 'Salamanca', capital: 'Salamanca', communityId: 'ESCL' },
  { id: 'ESSG', name: 'Segovia', capital: 'Segovia', communityId: 'ESCL' },
  { id: 'ESSO', name: 'Soria', capital: 'Soria', communityId: 'ESCL' },
  { id: 'ESVA', name: 'Valladolid', capital: 'Valladolid', communityId: 'ESCL' },
  { id: 'ESZA', name: 'Zamora', capital: 'Zamora', communityId: 'ESCL' },
  
  // Castilla-La Mancha
  { id: 'ESAB', name: 'Albacete', capital: 'Albacete', communityId: 'ESCM' },
  { id: 'ESCR', name: 'Ciudad Real', capital: 'Ciudad Real', communityId: 'ESCM' },
  { id: 'ESCU', name: 'Cuenca', capital: 'Cuenca', communityId: 'ESCM' },
  { id: 'ESGU', name: 'Guadalajara', capital: 'Guadalajara', communityId: 'ESCM' },
  { id: 'ESTO', name: 'Toledo', capital: 'Toledo', communityId: 'ESCM' },
  
  // Cataluña
  { id: 'ESB', name: 'Barcelona', capital: 'Barcelona', communityId: 'ESCT' },
  { id: 'ESGI', name: 'Gerona', capital: 'Gerona', communityId: 'ESCT' },
  { id: 'ESL', name: 'Lérida', capital: 'Lérida', communityId: 'ESCT' },
  { id: 'EST', name: 'Tarragona', capital: 'Tarragona', communityId: 'ESCT' },
  
  // Comunidad Valenciana
  { id: 'ESA', name: 'Alicante', capital: 'Alicante', communityId: 'ESVC' },
  { id: 'ESCS', name: 'Castellón', capital: 'Castellón de la Plana', communityId: 'ESVC' },
  { id: 'ESV', name: 'Valencia', capital: 'Valencia', communityId: 'ESVC' },
  
  // Extremadura
  { id: 'ESBA', name: 'Badajoz', capital: 'Badajoz', communityId: 'ESEX' },
  { id: 'ESCC', name: 'Cáceres', capital: 'Cáceres', communityId: 'ESEX' },
  
  // Galicia
  { id: 'ESC', name: 'La Coruña', capital: 'La Coruña', communityId: 'ESGA' },
  { id: 'ESLU', name: 'Lugo', capital: 'Lugo', communityId: 'ESGA' },
  { id: 'ESOR', name: 'Orense', capital: 'Orense', communityId: 'ESGA' },
  { id: 'ESPO', name: 'Pontevedra', capital: 'Pontevedra', communityId: 'ESGA' },
  
  // Madrid
  { id: 'ESM', name: 'Madrid', capital: 'Madrid', communityId: 'ESMD' },
  
  // Murcia
  { id: 'ESMU', name: 'Murcia', capital: 'Murcia', communityId: 'ESMC' },
  
  // Navarra
  { id: 'ESNA', name: 'Navarra', capital: 'Pamplona', communityId: 'ESNC' },
  
  // País Vasco
  { id: 'ESVI', name: 'Álava', capital: 'Vitoria-Gasteiz', communityId: 'ESPV' },
  { id: 'ESBI', name: 'Bizkaia', capital: 'Bilbao', communityId: 'ESPV' },
  { id: 'ESSS', name: 'Gipuzkoa', capital: 'San Sebastián', communityId: 'ESPV' },
  
  // La Rioja
  { id: 'ESLO', name: 'La Rioja', capital: 'Logroño', communityId: 'ESRI' },
  
  // Ceuta & Melilla
  { id: 'ESCE', name: 'Ceuta', capital: 'Ceuta', communityId: 'ESCE' },
  { id: 'ESML', name: 'Melilla', capital: 'Melilla', communityId: 'ESML' }
];
