import fs from 'fs';
import path from 'path';
import prisma from '../config/prisma';

export interface TaxonomyConfig {
  _meta: {
    disclaimer: string;
    version: string;
    lastUpdated: string;
  };
  departments: Array<{
    code: string;
    name: string;
    description?: string;
    categories: string[];
  }>;
}

export class TaxonomyService {
  private static getTaxonomyFilePath(): string {
    return path.resolve(__dirname, '../config/taxonomy.config.json');
  }

  public static getTaxonomy(): TaxonomyConfig {
    const filePath = this.getTaxonomyFilePath();
    if (!fs.existsSync(filePath)) {
      throw new Error(`Taxonomy config not found at ${filePath}`);
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  public static async getDepartments() {
    return prisma.department.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
  }

  public static getWardsAndLocalities(): { wards: string[]; localities: string[] } {
    return {
      wards: [
        'Ward 04', 'Ward 18', 'Ward 22', 'Ward 28', 'Ward 31', 'Ward 34',
        'Ward 46', 'Ward 47', 'Ward 48', 'Ward 52', 'Ward 53', 'Ward 58',
        'Ward 64', 'Ward 77', 'Ward 80'
      ],
      localities: [
        'Arera Colony', 'Ayodhya Bypass', 'Bairagarh', 'Govindpura',
        'Hoshangabad Road', 'Jahangirabad', 'Karond', 'Kolar Road',
        'MP Nagar Zone-1', 'MP Nagar Zone-2', 'New Market', 'Shahpura',
        'TT Nagar'
      ]
    };
  }
}
