import { McpServerCategorySchema } from 'app/mcp-catalog/schemas';
import { NextResponse } from 'next/server';

export async function GET() {
  const categories = McpServerCategorySchema.options;

  return NextResponse.json({ categories });
}
