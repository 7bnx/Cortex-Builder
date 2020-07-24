export interface Data {
  label: string;
  description: string;
}

export function Is(json:Data): boolean{
  return typeof(json.label) === 'string' && typeof(json.description) === 'string';
}