// Datos de países, regiones y comunas para Chile
export const countries = [
  {
    id: 1,
    name: 'Chile',
    code: 'CL',
    lat: -30.7566,
    lng: -71.5215,
    zoom: 4
  }
]

export const regions = {
  CL: [
    { id: 1, name: 'Región de Arica y Parinacota', code: 'XV', lat: -18.4861, lng: -70.2979 },
    { id: 2, name: 'Región de Tarapacá', code: 'I', lat: -20.3273, lng: -70.1431 },
    { id: 3, name: 'Región de Antofagasta', code: 'II', lat: -23.6585, lng: -70.3975 },
    { id: 4, name: 'Región de Atacama', code: 'III', lat: -27.3668, lng: -70.3321 },
    { id: 5, name: 'Región de Coquimbo', code: 'IV', lat: -29.9425, lng: -71.3353 },
    { id: 6, name: 'Región de Valparaíso', code: 'V', lat: -32.9898, lng: -71.5436 },
    { id: 7, name: 'Región del Libertador Bernardo O\'Higgins', code: 'VI', lat: -34.1699, lng: -71.2145 },
    { id: 8, name: 'Región del Maule', code: 'VII', lat: -35.4172, lng: -71.5545 },
    { id: 9, name: 'Región de Ñuble', code: 'XVI', lat: -36.5001, lng: -71.9482 },
    { id: 10, name: 'Región de La Araucanía', code: 'VIII', lat: -38.7369, lng: -72.5904 },
    { id: 11, name: 'Región de Los Ríos', code: 'XIV', lat: -39.8199, lng: -72.7272 },
    { id: 12, name: 'Región de Los Lagos', code: 'X', lat: -41.4769, lng: -72.3319 },
    { id: 13, name: 'Región de Aysén del General Carlos Ibáñez del Campo', code: 'XI', lat: -45.5951, lng: -72.0662 },
    { id: 14, name: 'Región de Magallanes y de la Antártica Chilena', code: 'XII', lat: -52.5200, lng: -68.9189 },
    { id: 15, name: 'Región Metropolitana de Santiago', code: 'XIII', lat: -33.4489, lng: -70.6693 }
  ]
}

// Comunas por región (principales)
export const communes = {
  XIII: [ // Región Metropolitana
    'Santiago',
    'Puente Alto',
    'La Florida',
    'Maipú',
    'Ñuñoa',
    'La Reina',
    'Providencia',
    'Vitacura',
    'Colina',
    'Concolorcillo',
    'Lampa',
    'Pirque',
    'San Bernardo',
    'Buin',
    'Paine',
    'Talagante',
    'Melipilla',
    'El Monte',
    'Curacaví',
    'Rancagua'
  ],
  V: [ // Valparaíso
    'Valparaíso',
    'Viña del Mar',
    'Quilpué',
    'Villa Alemana',
    'Limache',
    'Quillota',
    'La Calera',
    'Hijuela',
    'Nogales',
    'Cabildo'
  ],
  VI: [ // O\'Higgins
    'Rancagua',
    'San Fernando',
    'Santa Cruz',
    'Machalí',
    'Graneros',
    'Mostazal',
    'Pichidegua',
    'Requínoa'
  ],
  VII: [ // Maule
    'Talca',
    'Curicó',
    'Linares',
    'Cauquenes',
    'Constitución',
    'Maule',
    'Pelluhue',
    'Chillán'
  ],
  VIII: [ // La Araucanía
    'Temuco',
    'Pucón',
    'Villarrica',
    'Los Ángeles',
    'Collipulli',
    'Curacautín'
  ],
  X: [ // Los Lagos
    'Puerto Montt',
    'Puerto Varas',
    'Osorno',
    'Frutillar',
    'Llanquihue',
    'Calbuco',
    'Maullín'
  ]
}

export const getAllCountries = () => countries

export const getRegions = (countryCode) => {
  return regions[countryCode] || []
}

export const getCommunes = (regionCode) => {
  return communes[regionCode] || []
}
