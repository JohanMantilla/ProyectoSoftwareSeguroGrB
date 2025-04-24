export enum TipoSensible {
    SALUD = 'SALUD',
    BIOMETRICO = 'BIOMETRICO',
    GENETICO = 'GENETICO',
    IDEOLOGIA = 'IDEOLOGIA',
    RELIGION = 'RELIGION',
    ORIENTACION_SEXUAL = 'ORIENTACION_SEXUAL',
    ETNIA = 'ETNIA'
  }
  
  // src/personal-data/enums/tipo-arco.enum.ts
  export enum TipoArco {
    ACCESO = 'ACCESO',
    RECTIFICACION = 'RECTIFICACION',
    CANCELACION = 'CANCELACION',
    OPOSICION = 'OPOSICION'
  }
  
  // src/personal-data/enums/arco-status.enum.ts
  export enum ArcoStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    REJECTED = 'REJECTED'
  }
  
  // src/personal-data/enums/data-type.enum.ts
  export enum DataType {
    PERSONAL_DATA = 'PERSONAL_DATA',
    SENSITIVE_DATA = 'SENSITIVE_DATA'
  }
  
  // src/personal-data/enums/audit-action.enum.ts
  export enum AuditAction {
    CREATE = 'CREATE',
    READ = 'READ',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE'
  }