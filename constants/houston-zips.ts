/**
 * Houston-The Woodlands-Sugar Land MSA Zip Codes
 * CBSA 26420
 *
 * Includes all zip codes from:
 * - Harris County (Houston core)
 * - Fort Bend County (Sugar Land, Missouri City, Rosenberg)
 * - Montgomery County (The Woodlands, Conroe)
 * - Galveston County (Galveston, Texas City, League City)
 * - Brazoria County (Pearland, Alvin, Lake Jackson)
 * - Chambers County (Baytown area)
 * - Liberty County (Dayton, Cleveland)
 * - Waller County (Hempstead, Prairie View)
 * - Austin County (Bellville, Sealy)
 */

export const HOUSTON_METRO_ZIPS = new Set([
  // Harris County (Houston core + suburbs)
  '77001', '77002', '77003', '77004', '77005', '77006', '77007', '77008',
  '77009', '77010', '77011', '77012', '77013', '77014', '77015', '77016',
  '77017', '77018', '77019', '77020', '77021', '77022', '77023', '77024',
  '77025', '77026', '77027', '77028', '77029', '77030', '77031', '77032',
  '77033', '77034', '77035', '77036', '77037', '77038', '77039', '77040',
  '77041', '77042', '77043', '77044', '77045', '77046', '77047', '77048',
  '77049', '77050', '77051', '77052', '77053', '77054', '77055', '77056',
  '77057', '77058', '77059', '77060', '77061', '77062', '77063', '77064',
  '77065', '77066', '77067', '77068', '77069', '77070', '77071', '77072',
  '77073', '77074', '77075', '77076', '77077', '77078', '77079', '77080',
  '77081', '77082', '77083', '77084', '77085', '77086', '77087', '77088',
  '77089', '77090', '77091', '77092', '77093', '77094', '77095', '77096',
  '77098', '77099', '77201', '77336', '77338', '77339', '77345', '77346',
  '77357', '77365', '77373', '77375', '77377', '77379', '77388', '77396',
  '77429', '77433', '77447', '77449', '77450', '77484', '77489', '77493',
  '77494', '77504', '77506', '77530', '77532', '77536', '77547', '77562',
  '77571', '77587', '77598',

  // Fort Bend County (Sugar Land, Missouri City, Rosenberg, Richmond)
  '77406', '77417', '77459', '77461', '77469', '77471', '77477', '77478',
  '77479', '77489', '77498', '77545', '77583',

  // Montgomery County (The Woodlands, Conroe, Spring)
  '77301', '77302', '77303', '77304', '77305', '77306', '77316', '77318',
  '77328', '77356', '77362', '77363', '77372', '77378', '77380', '77381',
  '77382', '77384', '77385', '77386', '77393',

  // Galveston County (Galveston, League City, Texas City, Friendswood)
  '77510', '77517', '77539', '77546', '77548', '77549', '77550', '77551',
  '77552', '77554', '77555', '77568', '77573', '77590', '77591', '77592',

  // Brazoria County (Pearland, Alvin, Lake Jackson, Angleton, Freeport)
  '77414', '77422', '77511', '77514', '77515', '77541', '77566', '77578',
  '77581', '77584', '77588',

  // Chambers County (Baytown area, Anahuac)
  '77514', '77520', '77521', '77523', '77535', '77560', '77561', '77563',
  '77564', '77565', '77597',

  // Liberty County (Dayton, Cleveland, Liberty)
  '77327', '77328', '77331', '77334', '77575', '77597',

  // Waller County (Hempstead, Prairie View, Brookshire)
  '77423', '77445', '77446', '77484',

  // Austin County (Bellville, Sealy)
  '77418', '77474',
]);

/**
 * Validates if a zip code is in the Houston metro area
 * @param zip - 5-digit zip code string
 * @returns true if zip is in Houston MSA, false otherwise
 */
export function isHoustonZip(zip: string): boolean {
  return HOUSTON_METRO_ZIPS.has(zip);
}
