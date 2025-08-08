import { NextResponse } from 'next/server';

import { McpServerCategorySchema } from '@schemas';

export async function GET() {
  const categories = McpServerCategorySchema.options;

  return NextResponse.json({ categories });
}
