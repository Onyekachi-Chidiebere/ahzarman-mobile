/** `buypowerCode` = BuyPower v2 `disco` query value (city name codes, not brand IDs). */
export type Disco = { id: string; name: string; short: string; buypowerCode: string };

export const ELECTRICITY_DISCOS: Disco[] = [
  { id: 'AEDC', name: 'Abuja Electricity', short: 'FCT · Niger · Kogi · Nasarawa', buypowerCode: 'ABUJA' },
  { id: 'IKEDC', name: 'Ikeja Electric', short: 'Lagos — Ikeja axis', buypowerCode: 'IKEJA' },
  { id: 'EKEDC', name: 'Eko Electricity', short: 'Lagos — Island & Eko axis', buypowerCode: 'EKO' },
  {
    id: 'PHED',
    name: 'Port Harcourt Electric',
    short: 'Rivers · Bayelsa · Cross River · Akwa Ibom',
    buypowerCode: 'PORTHARCOURT',
  },
  { id: 'EEDC', name: 'Enugu Electricity', short: 'Enugu · Anambra · Imo · Abia · Ebonyi', buypowerCode: 'ENUGU' },
  { id: 'BEDC', name: 'Benin Electricity', short: 'Edo · Delta · Ondo · Ekiti', buypowerCode: 'BENIN' },
  { id: 'YEDC', name: 'Yola Electric', short: 'Adamawa · Taraba', buypowerCode: 'YOLA' },
  { id: 'KEDC', name: 'Kaduna Electric', short: 'Kaduna · Zamfara · Kebbi · Sokoto', buypowerCode: 'KADUNA' },
  { id: 'JED', name: 'Jos Electricity', short: 'Plateau · Benue · Gombe · Bauchi', buypowerCode: 'JOS' },
  { id: 'KAEDCO', name: 'Kano Electric (KAEDCO)', short: 'Kano · Jigawa · Katsina', buypowerCode: 'KANO' },
  { id: 'KEDCO', name: 'Kano Electricity (KEDCO)', short: 'Kano · Jigawa (alt. network)', buypowerCode: 'KANO' },
  { id: 'IBEDC', name: 'Ibadan Electricity', short: 'Oyo · Ogun · Osun · Kwara', buypowerCode: 'IBADAN' },
];
