export const StylesfilterAttr = (arrayAtr: number[], arrayOfAttrObject) => {
  let arrayFiltered = [];
  for (let atribute of arrayAtr) {
    arrayFiltered = [...arrayFiltered, ...arrayOfAttrObject.filter(a => a.id === atribute)];
  }
  return arrayFiltered
}

export const generateArrayAttr = (attr: string, arrayStyles) => {
  return arrayStyles.map(item => ({ 
    id: item[`${attr}Id`],
    styleId: item.id,
    name: item[attr],
    code: item[`${attr}Code`],
  }));
}

export const validateFilterBrandsAndDepartments = (brands, departments, p) => {
  let valid = true;
  if (brands.length && typeof p.brand === 'undefined') {
      valid = false;
  }
  if (departments.length && typeof p.department === 'undefined') {
      valid = false;
  }
  return valid;
}
