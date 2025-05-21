export interface InteractionAtribute {
  nombre: string;
  interaccion: Interaccion;
  type: string;
}

export interface SchemaAtribute {
  nombre: string;
  schema: TipoSchema
  type: string;
}

export interface AtributoForm {
  nombre: string;
  type: string;
}

export enum Interaccion {
  EVENTO,
  PROPIEDAD,
  ACCION,
  COMUN
}

export interface Tipo{
  nombre: string;
  schema: TipoSchema;
}

export enum TipoSchema {
  NULL,
  COMUN,
  INTEGER,
  NUMBER,
  STRING,
  BOOLEAN,
  ARRAY,
  OBJECT
}

export const atributosInteracciones: InteractionAtribute[] = [
  {
    nombre: 'forms',
    interaccion: Interaccion.COMUN,
    type: 'form'
  },
  {
    nombre: 'uriVariables',
    interaccion: Interaccion.COMUN,
    type: 'schema'
  },
  {
    nombre: 'observable',
    interaccion: Interaccion.PROPIEDAD,
    type: 'boolean'
  },
  {
    nombre: 'safe',
    interaccion: Interaccion.ACCION,
    type: 'boolean'
  },
  {
    nombre: 'idempotent',
    interaccion: Interaccion.ACCION,
    type: 'boolean'
  },
  {
    nombre: 'synchronous',
    interaccion: Interaccion.ACCION,
    type: 'boolean'
  },
  {
    nombre: 'input',
    interaccion: Interaccion.ACCION,
    type: 'schema'
  },
  {
    nombre: 'output',
    interaccion: Interaccion.ACCION,
    type: 'schema'
  },
  {
    nombre: 'subscription',
    interaccion: Interaccion.EVENTO,
    type: 'schema'
  },
  {
    nombre: 'data',
    interaccion: Interaccion.EVENTO,
    type: 'schema'
  },
  {
    nombre: 'cancellation',
    interaccion: Interaccion.EVENTO,
    type: 'schema'
  },
  {
    nombre: 'dataResponse',
    interaccion: Interaccion.EVENTO,
    type: 'schema'
  }
];

export const atributosSchema: SchemaAtribute[] = [
  {
    nombre: 'unit',
    schema: TipoSchema.COMUN,
    type: 'string'
  },
  {
    nombre: 'readOnly',
    schema: TipoSchema.COMUN,
    type: 'boolean'
  },
  {
    nombre: 'writeOnly',
    schema: TipoSchema.COMUN,
    type: 'boolean'
  },
  {
    nombre: 'format',
    schema: TipoSchema.COMUN,
    type: 'string'
  },
  {
    nombre: 'enum',
    schema: TipoSchema.COMUN,
    type: 'string'
  },
  {
    nombre: 'const',
    schema: TipoSchema.COMUN,
    type: 'string'
  },
  {
    nombre: 'default',
    schema: TipoSchema.COMUN,
    type: 'string'
  },
  {
    nombre: 'minimum',
    schema: TipoSchema.INTEGER,
    type: 'integer'
  },
  {
    nombre: 'exclusiveMinimum',
    schema: TipoSchema.INTEGER,
    type: 'integer'
  },
  {
    nombre: 'maximum',
    schema: TipoSchema.INTEGER,
    type: 'integer'
  },
  {
    nombre: 'exclusiveMaximum',
    schema: TipoSchema.INTEGER,
    type: 'integer'
  },
  {
    nombre: 'multipleOf',
    schema: TipoSchema.INTEGER,
    type: 'integer'
  },
  {
    nombre: 'minimum',
    schema: TipoSchema.NUMBER,
    type: 'double'
  },
  {
    nombre: 'exclusiveMinimum',
    schema: TipoSchema.NUMBER,
    type: 'integer'
  },
  {
    nombre: 'maximum',
    schema: TipoSchema.NUMBER,
    type: 'integer'
  },
  {
    nombre: 'exclusiveMaximum',
    schema: TipoSchema.NUMBER,
    type: 'integer'
  },
  {
    nombre: 'multipleOf',
    schema: TipoSchema.NUMBER,
    type: 'integer'
  },
  {
    nombre: 'minLength',
    schema: TipoSchema.STRING,
    type: 'integer'
  },
  {
    nombre: 'maxLength',
    schema: TipoSchema.STRING,
    type: 'integer'
  },
  {
    nombre: 'pattern',
    schema: TipoSchema.STRING,
    type: 'string'
  },
  {
    nombre: 'contentEncoding',
    schema: TipoSchema.STRING,
    type: 'string'
  },
  {
    nombre: 'contentMediaType',
    schema: TipoSchema.STRING,
    type: 'string'
  },
  {
    nombre: 'maxItems',
    schema: TipoSchema.ARRAY,
    type: 'integer'
  },
  {
    nombre: 'mimItems',
    schema: TipoSchema.ARRAY,
    type: 'integer'
  },
];

export const atributosForm: AtributoForm[] = [
  {
    nombre: 'op',
    type: 'array'
  },
  {
    nombre: 'contentType',
    type: 'string'
  },
  {
    nombre: 'contentCoding',
    type: 'string'
  },
  {
    nombre: 'subprotocol',
    type: 'string'
  },
  {
    nombre: 'security',
    type: 'array'
  },
  {
    nombre: 'scopes',
    type: 'array'
  }
];

export const atributosLink: AtributoForm[] = [
  {
    nombre: 'type',
    type: 'string'
  },
  {
    nombre: 'rel',
    type: 'string'
  },
  {
    nombre: 'anchor',
    type: 'string'
  },
  {
    nombre: 'sizes',
    type: 'string'
  },
  {
    nombre: 'hreflang',
    type: 'array'
  }
];

export const tiposSchema: Tipo[] = [
  {nombre: 'Integer', schema: TipoSchema.INTEGER },
  {nombre: 'Number', schema: TipoSchema.NUMBER },
  {nombre: 'Boolean', schema: TipoSchema.BOOLEAN },
  {nombre: 'String', schema: TipoSchema.STRING },
  {nombre: 'Array', schema: TipoSchema.ARRAY },
  {nombre: 'Object', schema: TipoSchema.OBJECT }
];

export const seguridadMap: { [clave: string]: string } = {
  'nosec_sc': 'nosec',
  'basic_sc': 'basic',
  'oauth2_sc': 'oauth2',
  'cert_sc': 'cert',
  'apikey_sc': 'apikey'
};
  
  
  
