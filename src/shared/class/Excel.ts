const xl = require('excel4node');

/*
 * Class of abstract excel4node library
 */
export class Excel {

  private workBook: any;
  private worksheets: any;

  constructor() {
    this.workBook = new xl.Workbook();
    this.worksheets = {};
  }

  getWorkBook(): any {
    return this.workBook;
  }

  setWorkSheets(worksheet: IWorkSheet): void {
    this.worksheets[worksheet.name] = this.workBook.addWorksheet(worksheet.name, worksheet.options);
  }

  getWorkSheets(worksheetName: string): any {
    return this.worksheets[worksheetName];
  }

  /**
   * Set cell value.
   * Specifies cells to set "A1" or "1, 1"
   */
  setCell(worksheetName: string, value: any, cell: string): void;
  setCell(worksheetName: string, value: any, row: number, col: number): void;
  setCell(worksheetName: string, value: any, param1: number | string, param2?: number): void {
    let row = 0;
    let col = 0;
    if (typeof param1 === 'string') {
      const index = xl.getExcelRowCol(param1);
      row = index.row;
      col = index.col;
    } else if (typeof param1 === 'number' && param2) {
        row = param1;
        col = param2;
    } else {
      throw new Error('Invalid arguments');
    }

    switch (value) {
      case '':
      case undefined:
      case null:
        this.worksheets[worksheetName].cell(row, col).string('');
        break;
      case false:
      case 'false':
      case 'NO':
      case 'no':
        this.worksheets[worksheetName].cell(row, col).string('NO');
        break;
      case true:
      case 'true':
      case 'YES':
      case 'yes':
        this.worksheets[worksheetName].cell(row, col).string('YES');
        break;
      default:
        if (!isNaN(value) && !this.isNullOrWhiteSpace(value)) {
          this.worksheets[worksheetName].cell(row, col).number(parseInt(value, 10));
        } else {
          this.worksheets[worksheetName].cell(row, col).string(value.trim().replace(/(\r\n|\n|\r|")/gm, ''));
        }
    }
  }

  setHeaders(worksheetName: string, headers: string[]): void {
      headers.forEach((header, index ) => {
        this.setCell(worksheetName, header, 1, index + 1);
      });
  }

  /**
   * Function to set the data on a worksheet * data is array of object of the output csv of handsontable.
   */
  setDataToWorksheet(worksheetName: string, data: any[]): void {
    const lengthRows = data.length;
    const columns = Object.keys(data[0]);
    const lengthColumns = columns.length;

    for (let i = 0; i < lengthRows; i++) {
      for (let j = 0; j < lengthColumns; j++) {
        this.setCell(worksheetName, data[i][columns[j]], i + 2, j + 1);
      }
    }
  }

  /**
   * Accepts a validation options object with these available options.
   * Specifies range of cells to apply validate "A1:A100" or "1, 1, 1, 100"
   */
  setValidationList(worksheetName: string, formulas: string, range: string): void;
  setValidationList(worksheetName: string, formulas: string,  startRow: number, startColumn: number, endRow: number, endColumn: number): void;
  setValidationList(worksheetName: string, formulas: string,  param1: number | string, param2?: number, param3?: number, param4?: number): void {
    let sqref: string;
    if (typeof param1 === 'string') {
      sqref = param1;
    } else if (typeof param1 === 'number' && param2 && param3 && param4) {
      const startCell = xl.getExcelCellRef(param1, param2);
      const endCell =  xl.getExcelCellRef(param3, param4);
      sqref = `${startCell}:${endCell}`;
    } else {
      throw new Error('Invalid arguments');
    }

    this.worksheets[worksheetName].addDataValidation({
      type: 'list',
      allowBlank: true,
      showDropDown: true,
      sqref,
      formulas: [formulas],
    });
  }

  /**
   * Lock a range of cells.
   * Specifies range of cells to apply validate "A1:A100" or "1, 1, 1, 100"
   */
  lockCells(worksheetName: string, range: string): void;
  lockCells(worksheetName: string, startRow: number, startColumn: number, endRow: number, endColumn: number): void;
  lockCells(worksheetName: string, param1: number | string, param2?: number, param3?: number, param4?: number): void {
    let sqref: string;
    if (typeof param1 === 'string') {
      sqref = param1;
    } else if (typeof param1 === 'number' && param2 && param3 && param4) {
      const startCell = xl.getExcelCellRef(param1, param2);
      const endCell =  xl.getExcelCellRef(param3, param4);
      sqref = `${startCell}:${endCell}`;
    } else {
      throw new Error('Invalid arguments');
    }

    this.worksheets[worksheetName].addDataValidation({
      type: 'textLength',
      error: 'This cell is locked',
      operator: 'equal',
      sqref,
      formulas: [''],
    });
  }

  setFormula(worksheetName: string, row: number, col: number, formula: string): void {
    this.worksheets[worksheetName].cell(row, col).formula(formula);
  }

  setCellStyle(worksheetName: string, style: any, startRow: number, startColumn: number): void;
  setCellStyle(worksheetName: string, style: any, startRow: number, startColumn: number, endRow: number, endColumn: number): void;
  setCellStyle(worksheetName: string, style: any, startRow: number, startColumn: number, endRow?: number, endColumn?: number): void {
    if (endRow && endColumn) {
      this.worksheets[worksheetName].cell(startRow, startColumn, endRow, endColumn).style(this.workBook.createStyle(style));
    } else {
      this.worksheets[worksheetName].cell(startRow, startColumn).style(this.workBook.createStyle(style));
    }
  }

  hideCol(worksheetName: string, indexCol: number): void {
    this.worksheets[worksheetName].column(indexCol).hide();
  }

  hideRow(worksheetName: string, indexRow: number): void {
    this.worksheets[worksheetName].row(indexRow).hide();
  }

  private isNullOrWhiteSpace(str: string | any) {
    return (!str || str.length === 0 || /^\s*$/.test(str));
  }
}

export interface IWorkSheet {
  name: string;
  options?: any;
}
