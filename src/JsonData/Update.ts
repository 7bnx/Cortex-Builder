export interface Data{
  date: number;
}

export function Is(json:Data): boolean{
  return typeof(json.date) === 'number';
}