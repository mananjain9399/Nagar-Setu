import csvParser from 'csv-parser';
import { Readable } from 'stream';
import prisma from '../../config/prisma';

export interface TaxonomyValidationReport {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    departmentCount: number;
    categoryCount: number;
  };
}

export interface NormalizedTaxonomyRecord {
  departmentCode: string;
  departmentName: string;
  categoryCode?: string;
  categoryName?: string;
  description?: string;
  active: boolean;
}

export class TaxonomyManager {
  public static async getFullTaxonomy() {
    return prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        categories: {
          orderBy: { name: 'asc' },
        },
      },
    });
  }

  public static validateTaxonomyPayload(records: any[]): TaxonomyValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];
    const deptCodes = new Set<string>();
    const deptCodeToName = new Map<string, string>();
    const catCodes = new Set<string>();

    if (!Array.isArray(records) || records.length === 0) {
      return {
        valid: false,
        errors: ['Taxonomy payload is empty or not an array.'],
        warnings: [],
        summary: { departmentCount: 0, categoryCount: 0 },
      };
    }

    records.forEach((row, idx) => {
      const line = idx + 1;
      const deptCode = (row.department_code || row.dept_code || row.code || '').trim();
      const deptName = (row.department_name || row.dept_name || row.name || '').trim();
      const catCode = (row.category_code || row.cat_code || '').trim();
      const catName = (row.category_name || row.cat_name || '').trim();

      // Check category-to-department relationship
      if ((catCode || catName) && (!deptCode || !deptName)) {
        errors.push(`Row ${line}: Category '${catCode || catName}' does not belong to a valid department.`);
      }

      if (!deptCode) {
        errors.push(`Row ${line}: Missing department code.`);
      } else {
        if (deptCodeToName.has(deptCode)) {
          if (deptCodeToName.get(deptCode) !== deptName) {
            errors.push(
              `Row ${line}: Conflicting department name for code '${deptCode}' ('${deptCodeToName.get(deptCode)}' vs '${deptName}'). Department codes must be unique.`
            );
          } else if (!catCode && !row.categories) {
            errors.push(`Row ${line}: Duplicate department code '${deptCode}' found in payload.`);
          }
        } else {
          deptCodeToName.set(deptCode, deptName);
          deptCodes.add(deptCode);
        }
      }

      if (!deptName) {
        errors.push(`Row ${line}: Missing department name.`);
      }

      // If category fields are present (flat format)
      if (catCode) {
        if (catCodes.has(catCode)) {
          errors.push(`Row ${line}: Category code '${catCode}' is not unique. Category codes must be unique.`);
        }
        catCodes.add(catCode);
        if (!catName) {
          errors.push(`Row ${line}: Category code '${catCode}' has no name provided.`);
        }
      }

      // If nested format (categories array)
      if (Array.isArray(row.categories)) {
        if (!deptCode || !deptName) {
          errors.push(`Row ${line}: Categories list provided without a valid department.`);
        }
        row.categories.forEach((cat: any, cIdx: number) => {
          const cCode = (cat.code || cat.category_code || '').trim();
          const cName = (cat.name || cat.category_name || '').trim();
          if (!cCode) {
            errors.push(`Row ${line}, Category ${cIdx + 1}: Missing category code.`);
          } else {
            if (catCodes.has(cCode)) {
              errors.push(
                `Row ${line}, Category ${cIdx + 1}: Category code '${cCode}' is not unique. Category codes must be unique.`
              );
            }
            catCodes.add(cCode);
          }
          if (!cName) {
            errors.push(`Row ${line}, Category ${cIdx + 1}: Missing category name.`);
          }
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      summary: {
        departmentCount: deptCodes.size,
        categoryCount: catCodes.size,
      },
    };
  }

  public static async parseCSVString(csvContent: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from([csvContent]);
      stream
        .pipe(
          csvParser({
            mapHeaders: ({ header }) => header.trim().toLowerCase().replace(/\s+/g, '_'),
          })
        )
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    });
  }

  public static async importTaxonomy(records: any[]) {
    const validation = this.validateTaxonomyPayload(records);
    if (!validation.valid) {
      throw new Error(`Taxonomy validation failed: ${validation.errors.join('; ')}`);
    }

    let deptCount = 0;
    let catCount = 0;

    for (const row of records) {
      const deptCode = (row.department_code || row.dept_code || row.code || '').trim();
      const deptName = (row.department_name || row.dept_name || row.name || '').trim();
      const desc = row.description || null;
      const active = row.active === undefined ? true : String(row.active).toLowerCase() !== 'false';

      if (!deptCode || !deptName) continue;

      const dept = await prisma.department.upsert({
        where: { code: deptCode },
        update: {
          name: deptName,
          description: desc,
          active,
        },
        create: {
          code: deptCode,
          name: deptName,
          description: desc,
          active,
        },
      });
      deptCount++;

      // Handle flat category
      const catCode = (row.category_code || row.cat_code || '').trim();
      const catName = (row.category_name || row.cat_name || '').trim();
      if (catCode && catName) {
        await prisma.category.upsert({
          where: { code: catCode },
          update: {
            name: catName,
            departmentId: dept.id,
            description: desc,
            active,
          },
          create: {
            code: catCode,
            name: catName,
            departmentId: dept.id,
            description: desc,
            active,
          },
        });
        catCount++;
      }

      // Handle nested categories
      if (Array.isArray(row.categories)) {
        for (const cat of row.categories) {
          const cCode = (cat.code || cat.category_code || '').trim();
          const cName = (cat.name || cat.category_name || '').trim();
          const cDesc = cat.description || null;
          const cActive = cat.active === undefined ? true : String(cat.active).toLowerCase() !== 'false';

          if (cCode && cName) {
            await prisma.category.upsert({
              where: { code: cCode },
              update: {
                name: cName,
                departmentId: dept.id,
                description: cDesc,
                active: cActive,
              },
              create: {
                code: cCode,
                name: cName,
                departmentId: dept.id,
                description: cDesc,
                active: cActive,
              },
            });
            catCount++;
          }
        }
      }
    }

    return {
      success: true,
      importedDepartments: deptCount,
      importedCategories: catCount,
      warnings: validation.warnings,
    };
  }
}
